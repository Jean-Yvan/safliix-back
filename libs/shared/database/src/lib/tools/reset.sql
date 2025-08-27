DO
$func$
BEGIN
  EXECUTE
    (SELECT string_agg('TRUNCATE TABLE "' || tablename || '" RESTART IDENTITY CASCADE;', ' ')
       FROM pg_tables
      WHERE schemaname = 'public');
END;
$func$;