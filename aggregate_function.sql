-- Clean up first
DROP TABLE IF EXISTS agg_result CASCADE;

-- Table is required to be able to return a SETOF value, which is supported by Hasura
CREATE TABLE agg_result(
    AU01 double precision,
    AU04 double precision,
    AU09 double precision,
    AU10 double precision,
    AU12 double precision,
    AU14 double precision,
    grouped_seconds numeric
);

-- Function that aggregates the data at the specified resolution in seconds
CREATE OR REPLACE FUNCTION testAggAU(seconds NUMERIC) RETURNS SETOF agg_result
as
$$
    select avg("AU01_r"), avg("AU04_r"), avg("AU09_r"), avg("AU10_r"), avg("AU12_r"), avg("AU14_r"), CAST(timestamp / seconds as DECIMAL (10,0)) as grouped_seconds
    from data
    group by grouped_seconds
    order by min(timestamp);
$$ LANGUAGE SQL STABLE;
