-- One-time cleanup: remove the original inaccurate San Diego court rows.
-- Run this AFTER running supabase/seeds/san_diego_courts.sql so the corrected
-- rows already exist before the old ones are deleted.
--
-- The old rows fall into three categories, each handled separately below.

begin;

-- ── 1. Courts whose NAME changed ────────────────────────────────────────────
-- The corrected seed inserted these under new names, so the old names are
-- unambiguous targets.

delete from public.courts
where name in (
  'Mission Bay Tennis Courts',        -- replaced by: Murray Ridge Park Tennis Courts
  'Golden Hill Tennis Courts',         -- replaced by: Golden Hill Recreation Center
  'Chollas Lake Park Tennis Courts',   -- replaced by: Chollas Lake Recreation Center
  'Clairemont Recreation Center',      -- replaced by: North Clairemont Recreation Center
  'La Jolla Recreation Center Tennis', -- replaced by: La Jolla Recreation Center
  'UCSD Recreation Tennis Courts',     -- replaced by: UCSD Northview Tennis Courts
  'USD Tennis Center',                 -- replaced by: USD Hogan Tennis Center
  'Del Mar Shores Tennis Courts',      -- replaced by: Del Mar Tennis Courts
  'Chula Vista Olympic Training Center',-- replaced by: Chula Vista Elite Athlete Training Center
  'Hilltop Park Tennis Courts'         -- replaced by: Hilltop Park
);

-- ── 2. Same name, old ADDRESS (address was corrected) ───────────────────────
-- Match on both name + old address so we don't touch the corrected row.

delete from public.courts
where (name = 'Presidio Park Tennis Courts'
       and address = '2075 Jackson St, San Diego, CA 92110')   -- corrected to 2811
   or (name = 'Carmel Valley Recreation Center'
       and address = '4734 Santa Fe Ln, San Diego, CA 92130'); -- corrected to 3777 Townsgate Dr

-- ── 3. Same name and address, old COORDINATES ───────────────────────────────
-- Match on name + exact original lat value. The corrected rows have
-- sufficiently different coords that there is no risk of collision.

delete from public.courts
where (name = 'Morley Field Tennis Complex'   and lat = 32.7342)  -- corrected to 32.73834
   or (name = 'Robb Field Tennis Courts'      and lat = 32.7477)  -- corrected to 32.75325
   or (name = 'North Park Recreation Center'  and lat = 32.7487)  -- corrected to 32.75091
   or (name = 'Kearny Mesa Recreation Center' and lat = 32.8248)  -- corrected to 32.80110
   or (name = 'La Jolla Tennis Club'          and lat = 32.8416); -- corrected to 32.84560

commit;
