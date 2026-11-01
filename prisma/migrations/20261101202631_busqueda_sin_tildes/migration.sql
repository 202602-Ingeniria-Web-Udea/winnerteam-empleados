-- Nombre normalizado para buscar sin importar tildes ni mayúsculas.
ALTER TABLE "Employee" ADD COLUMN "nameSearch" TEXT NOT NULL DEFAULT '';

-- Rellena los empleados existentes con la misma regla que normalizeSearch()
-- (lib/list-params.ts): minúsculas, sin tildes ni diéresis, espacios simples.
UPDATE "Employee"
SET "nameSearch" = regexp_replace(
  trim(lower(translate("name",
    'ÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑÇáàäâéèëêíìïîóòöôúùüûñç',
    'AAAAEEEEIIIIOOOOUUUUNCaaaaeeeeiiiioooouuuunc'))),
  '\s+', ' ', 'g');
