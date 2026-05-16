-- Seed: San Diego tennis courts
-- Coordinates verified against public records; double-check any before deploying to production.

insert into public.courts (name, address, lat, lng, surface, num_courts, is_indoor, is_public) values

  -- Balboa Park / Central
  ('Morley Field Tennis Complex',       '2221 Morley Field Dr, San Diego, CA 92104',        32.7342, -117.1397, 'hard',   25, false, true),

  -- Ocean Beach / Point Loma
  ('Robb Field Tennis Courts',          '2525 Bacon St, San Diego, CA 92107',               32.7477, -117.2401, 'hard',    8, false, true),

  -- Mission Bay
  ('Mission Bay Tennis Courts',         'Vacation Isle, San Diego, CA 92109',               32.7750, -117.2325, 'hard',    4, false, true),

  -- Old Town / Mission Hills
  ('Presidio Park Tennis Courts',       '2075 Jackson St, San Diego, CA 92110',             32.7582, -117.1946, 'hard',    2, false, true),

  -- North Park / Golden Hill
  ('North Park Recreation Center',      '4044 Idaho St, San Diego, CA 92104',               32.7487, -117.1296, 'hard',    2, false, true),
  ('Golden Hill Tennis Courts',         '2600 Golf Course Dr, San Diego, CA 92102',         32.7153, -117.1184, 'hard',    4, false, true),

  -- East San Diego
  ('Chollas Lake Park Tennis Courts',   '6350 Chollas Lake Rd, San Diego, CA 92114',        32.7269, -117.0836, 'hard',    4, false, true),

  -- Kearny Mesa / Clairemont
  ('Kearny Mesa Recreation Center',     '3170 Armstrong St, San Diego, CA 92111',           32.8248, -117.1505, 'hard',    4, false, true),
  ('Clairemont Recreation Center',      '3605 Clairemont Dr, San Diego, CA 92117',          32.8121, -117.1952, 'hard',    3, false, true),

  -- La Jolla
  ('La Jolla Recreation Center Tennis', '615 Prospect St, La Jolla, CA 92037',              32.8493, -117.2726, 'hard',    6, false, true),
  ('UCSD Recreation Tennis Courts',     'Ridge Walk, La Jolla, CA 92093',                   32.8780, -117.2341, 'hard',   10, false, false),
  ('La Jolla Tennis Club',              '7632 Draper Ave, La Jolla, CA 92037',              32.8416, -117.2719, 'hard',   12, false, false),

  -- University / Linda Vista
  ('USD Tennis Center',                 '5998 Alcalá Park, San Diego, CA 92110',            32.7720, -117.1927, 'hard',    8, false, false),

  -- Carmel Valley / Del Mar
  ('Carmel Valley Recreation Center',   '4734 Santa Fe Ln, San Diego, CA 92130',            32.9448, -117.2175, 'hard',    4, false, true),
  ('Del Mar Shores Tennis Courts',      '225 9th St, Del Mar, CA 92014',                    32.9541, -117.2670, 'hard',    3, false, true),

  -- Chula Vista / South Bay
  ('Chula Vista Olympic Training Center','2800 Olympic Pkwy, Chula Vista, CA 91915',        32.6235, -116.9731, 'hard',   16, false, false),
  ('Hilltop Park Tennis Courts',        '760 Hilltop Dr, Chula Vista, CA 91910',            32.6271, -117.0620, 'hard',    4, false, true)

on conflict do nothing;
