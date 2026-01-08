
-- Seed 20 additional Kenyan nominees with random votes below 560

-- Insert 20 Kenyan nominees with vote_count = 0 initially
INSERT INTO public.creators (user_id, full_name, alias, email, bio, category_id, is_approved, is_active, vote_count, profile_photo_url)
SELECT 
  gen_random_uuid(),
  names.full_name,
  names.alias,
  names.email,
  names.bio,
  (SELECT id FROM public.categories ORDER BY random() LIMIT 1),
  true,
  true,
  0,
  NULL
FROM (VALUES
  ('Wanjiku Muthoni', 'Wanji Creates', 'wanjiku.muthoni@email.com', 'Lifestyle and fashion content creator from Nairobi, sharing Kenyan culture with the world.'),
  ('Ochieng Otieno', 'Ochi Beats', 'ochieng.otieno@email.com', 'Music producer and beatmaker bringing Luo rhythms to modern Afrobeats.'),
  ('Akinyi Adhiambo', 'Akinyi Cooks', 'akinyi.adhiambo@email.com', 'Celebrating Kenyan cuisine through authentic recipes and cooking tutorials.'),
  ('Kamau Njoroge', 'Kamau Tech', 'kamau.njoroge@email.com', 'Tech reviewer and gadget enthusiast helping Kenyans make smart tech choices.'),
  ('Nyambura Wangari', 'Nyambura Vlogs', 'nyambura.wangari@email.com', 'Daily vlogger documenting life in Nakuru and the Rift Valley.'),
  ('Kipchoge Korir', 'Kipchoge Fitness', 'kipchoge.korir@email.com', 'Fitness coach inspired by Kenyan running legends, promoting healthy living.'),
  ('Wambui Kariuki', 'Wambui Reads', 'wambui.kariuki@email.com', 'Book reviewer and literary enthusiast promoting African literature.'),
  ('Onyango Omondi', 'Onyango Comedy', 'onyango.omondi@email.com', 'Stand-up comedian bringing Kenyan humor to digital platforms.'),
  ('Chebet Kipruto', 'Chebet Fashion', 'chebet.kipruto@email.com', 'Fashion designer showcasing modern Kenyan designs and sustainable fashion.'),
  ('Mwangi Gitau', 'Mwangi Motors', 'mwangi.gitau@email.com', 'Automotive enthusiast reviewing cars and motorbikes in Kenya.'),
  ('Njeri Waithaka', 'Njeri Beauty', 'njeri.waithaka@email.com', 'Beauty and skincare tips for African skin, celebrating natural beauty.'),
  ('Mutiso Kioko', 'Mutiso Gaming', 'mutiso.kioko@email.com', 'Esports player and gaming content creator from Machakos.'),
  ('Awino Auma', 'Awino Travel', 'awino.auma@email.com', 'Travel blogger exploring hidden gems across Kenya and East Africa.'),
  ('Njenga Mburu', 'Njenga Art', 'njenga.mburu@email.com', 'Digital artist and illustrator creating African-inspired artwork.'),
  ('Wafula Simiyu', 'Wafula Sports', 'wafula.simiyu@email.com', 'Sports analyst covering Kenyan football and athletics.'),
  ('Moraa Nyakundi', 'Moraa Talks', 'moraa.nyakundi@email.com', 'Podcast host discussing youth empowerment and entrepreneurship.'),
  ('Karanja Maina', 'Karanja Films', 'karanja.maina@email.com', 'Filmmaker creating short films that tell authentic Kenyan stories.'),
  ('Achieng Odongo', 'Achieng Music', 'achieng.odongo@email.com', 'Singer-songwriter blending traditional Luo music with contemporary sounds.'),
  ('Kiptoo Chelimo', 'Kiptoo Agri', 'kiptoo.chelimo@email.com', 'Agricultural content creator promoting modern farming in Kenya.'),
  ('Mumbi Kimani', 'Mumbi Parenting', 'mumbi.kimani@email.com', 'Parenting blogger sharing tips for raising children in Kenya.')
) AS names(full_name, alias, email, bio);

-- Create a temporary table to store random vote counts for each new creator
DO $$
DECLARE
  creator_rec RECORD;
  random_votes INT;
  i INT;
BEGIN
  FOR creator_rec IN 
    SELECT id FROM public.creators 
    WHERE email IN (
      'wanjiku.muthoni@email.com', 'ochieng.otieno@email.com', 'akinyi.adhiambo@email.com',
      'kamau.njoroge@email.com', 'nyambura.wangari@email.com', 'kipchoge.korir@email.com',
      'wambui.kariuki@email.com', 'onyango.omondi@email.com', 'chebet.kipruto@email.com',
      'mwangi.gitau@email.com', 'njeri.waithaka@email.com', 'mutiso.kioko@email.com',
      'awino.auma@email.com', 'njenga.mburu@email.com', 'wafula.simiyu@email.com',
      'moraa.nyakundi@email.com', 'karanja.maina@email.com', 'achieng.odongo@email.com',
      'kiptoo.chelimo@email.com', 'mumbi.kimani@email.com'
    )
  LOOP
    random_votes := floor(random() * 560)::int;
    FOR i IN 1..random_votes LOOP
      INSERT INTO public.votes (creator_id, voter_ip, created_at)
      VALUES (
        creator_rec.id,
        'seeded-ke-' || i || '-' || substr(md5(random()::text), 1, 8),
        now() - (random() * interval '30 days')
      );
    END LOOP;
  END LOOP;
END $$;
