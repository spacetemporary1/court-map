-- Seed: San Diego tennis courts
-- Coordinates sourced from Google Maps URLs, City of San Diego Parks & Rec records,
-- and tennis court directories (tennisround.com, globaltennisnetwork.com).

insert into public.courts (name, address, lat, lng, surface, num_courts, is_indoor, is_public) values

  -- Balboa Park / Central
  -- coords from Google Maps place pin
  ('Morley Field Tennis Complex',           '2221 Morley Field Dr, San Diego, CA 92104',    32.73834, -117.13908, 'hard',  25, false, true),

  -- Ocean Beach / Point Loma
  -- coords from Google Maps place pin
  ('Robb Field Tennis Courts',              '2525 Bacon St, San Diego, CA 92107',           32.75325, -117.24145, 'hard',  12, false, true),

  -- Mission Valley / Kearny area
  -- Murray Ridge Park confirmed in SD Parks & Rec tennis court list
  ('Murray Ridge Park Tennis Courts',       '8651 Celestine Ave, San Diego, CA 92123',      32.79050, -117.14680, 'hard',   1, false, true),

  -- Old Town / Mission Hills
  -- address corrected from 2075 to 2811 Jackson St per city records
  ('Presidio Park Tennis Courts',           '2811 Jackson St, San Diego, CA 92110',         32.75777, -117.19386, 'hard',   2, false, true),

  -- North Park / Golden Hill
  -- coords from Google Maps search result
  ('North Park Recreation Center',          '4044 Idaho St, San Diego, CA 92104',           32.75091, -117.13417, 'hard',   3, false, true),
  ('Golden Hill Recreation Center',         '2600 Golf Course Dr, San Diego, CA 92102',     32.71520, -117.11830, 'hard',   4, false, true),

  -- East San Diego
  -- address corrected from "Chollas Lake Rd" to "College Grove Dr" per city records
  ('Chollas Lake Recreation Center',        '6350 College Grove Dr, San Diego, CA 92115',   32.73734, -117.07166, 'hard',   2, false, true),

  -- Kearny Mesa / Clairemont
  -- coords corrected; previous coords were ~800m off
  ('Kearny Mesa Recreation Center',         '3170 Armstrong St, San Diego, CA 92111',       32.80110, -117.16750, 'hard',   4, false, true),
  -- name and address corrected to North Clairemont; previous entry had wrong address
  ('North Clairemont Recreation Center',    '4421 Bannock Ave, San Diego, CA 92117',        32.83247, -117.19736, 'hard',   1, false, true),

  -- La Jolla
  -- coords corrected; previous coords were ~700m off
  ('La Jolla Recreation Center',            '615 Prospect St, La Jolla, CA 92037',          32.84333, -117.27785, 'hard',   2, false, true),
  -- name corrected to Northview Courts; address corrected from "Ridge Walk"
  ('UCSD Northview Tennis Courts',          'North Point Lane, La Jolla, CA 92093',         32.88290, -117.23840, 'hard',   8, false, false),
  ('La Jolla Tennis Club',                  '7632 Draper Ave, La Jolla, CA 92037',          32.84560, -117.27260, 'hard',  12, false, false),

  -- University / Linda Vista
  -- name corrected to official facility name; coords refined
  ('USD Hogan Tennis Center',               '5998 Alcalá Park, San Diego, CA 92110',        32.77166, -117.19157, 'hard',   8, false, false),

  -- Carmel Valley / Del Mar
  -- address corrected from "4734 Santa Fe Ln" to "3777 Townsgate Dr"; coords corrected
  ('Carmel Valley Recreation Center',       '3777 Townsgate Dr, San Diego, CA 92130',       32.94867, -117.23437, 'hard',   6, false, true),
  -- name and address corrected; courts are at 21st & Court St, not "225 9th St"
  ('Del Mar Tennis Courts',                 '201 Court St, Del Mar, CA 92014',              32.95830, -117.26490, 'hard',   2, false, true),

  -- Chula Vista / South Bay
  -- name corrected from "Olympic Training Center" to current official name
  ('Chula Vista Elite Athlete Training Center', '2800 Olympic Pkwy, Chula Vista, CA 91915', 32.62090, -116.97260, 'hard',  16, false, false),
  -- address corrected from "760" to "780" Hilltop Dr
  ('Hilltop Park',                          '780 Hilltop Dr, Chula Vista, CA 91911',        32.62740, -117.06290, 'hard',   4, false, true)

on conflict do nothing;
