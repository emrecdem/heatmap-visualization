-- Clean up first
DROP TABLE IF EXISTS agg_result CASCADE;

-- Table is required to be able to return a SETOF value, which is supported by Hasura
CREATE TABLE agg_result(
    min_timestamp double precision,
    AU01r double precision,
    AU04r double precision,
    AU09r double precision,
    AU10r double precision,
    AU12r double precision,
    AU14r double precision,
    AU01c double precision,
    AU04c double precision,
    AU09c double precision,
    AU10c double precision,
    AU12c double precision,
    AU14c double precision,
    grouped_seconds double precision
);

-- Function that aggregates the data at the specified resolution in seconds
CREATE OR REPLACE FUNCTION testAggAU(start_time double precision, end_time double precision, resolution NUMERIC) RETURNS SETOF agg_result
as
$$
    select min(timestamp) as min_timestamp, 
        avg("AU01_r"), avg("AU04_r"), avg("AU09_r"), avg("AU10_r"), avg("AU12_r"), avg("AU14_r"), 
        avg("AU01_c"), avg("AU04_c"), avg("AU09_c"), avg("AU10_c"), avg("AU12_c"), avg("AU14_c"), 
        FLOOR(timestamp / resolution) as grouped_seconds
    from data
    where timestamp >= start_time AND timestamp < end_time
    group by grouped_seconds
    order by min(timestamp);
$$ LANGUAGE SQL STABLE;
