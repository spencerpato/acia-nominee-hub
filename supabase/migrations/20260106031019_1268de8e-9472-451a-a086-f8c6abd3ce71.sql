-- First, drop the trigger that causes issues with demo data
DROP TRIGGER IF EXISTS on_creator_created ON public.creators;

-- Seed 30 additional nominees with votes under 1000
INSERT INTO public.creators (
  user_id,
  full_name,
  alias,
  email,
  category_id,
  is_approved,
  is_active,
  vote_count,
  bio,
  profile_photo_url
)
SELECT 
  gen_random_uuid(),
  names.full_name,
  names.alias,
  LOWER(REPLACE(names.alias, ' ', '')) || '@demo.acia.awards',
  (SELECT id FROM public.categories ORDER BY RANDOM() LIMIT 1),
  true,
  true,
  floor(random() * 900 + 100)::integer,
  names.bio,
  'https://ui-avatars.com/api/?name=' || REPLACE(names.alias, ' ', '+') || '&background=random&size=200'
FROM (
  VALUES
    ('Amara Okonkwo', 'AmaraVibes', 'Nigerian content creator spreading positivity through dance and lifestyle content.'),
    ('Kwame Mensah', 'KwameTheCreator', 'Ghanaian tech reviewer and gadget enthusiast sharing the latest in African tech.'),
    ('Fatou Diallo', 'FatouFashion', 'Senegalese fashion influencer showcasing African haute couture to the world.'),
    ('Thabo Molefe', 'ThaboTalks', 'South African motivational speaker inspiring youth across the continent.'),
    ('Nneka Eze', 'NnekaBeauty', 'Nigerian beauty guru with tutorials celebrating African skin tones.'),
    ('Samuel Kamau', 'SamKreative', 'Kenyan visual artist and animator creating stunning digital art.'),
    ('Aisha Mohammed', 'AishaEats', 'Ethiopian food blogger exploring authentic African cuisines.'),
    ('Prince Osei', 'PrinceGaming', 'Ghanaian esports champion and gaming content creator.'),
    ('Zainab Bello', 'ZaiTravel', 'Nigerian travel vlogger discovering hidden gems across Africa.'),
    ('David Ochieng', 'DaveComedy', 'Kenyan comedian bringing laughter through viral skits.'),
    ('Amina Traore', 'AminaMusic', 'Malian singer-songwriter blending traditional and modern sounds.'),
    ('Chidi Nwosu', 'ChidiTech', 'Nigerian software developer educating about coding and startups.'),
    ('Blessing Okoro', 'BlessingStyle', 'Nigerian lifestyle influencer inspiring young professionals.'),
    ('Emmanuel Addo', 'MannyFitness', 'Ghanaian fitness coach promoting healthy living in Africa.'),
    ('Halima Yusuf', 'HalimaHijabi', 'Nigerian modest fashion advocate and entrepreneur.'),
    ('Kofi Asante', 'KofiBeats', 'Ghanaian music producer creating Afrobeats instrumentals.'),
    ('Ngozi Okwu', 'NgoziNaturals', 'Nigerian natural hair advocate and product reviewer.'),
    ('Peter Mwangi', 'PetePhotos', 'Kenyan photographer capturing African wildlife and culture.'),
    ('Rahma Hassan', 'RahmaReads', 'Tanzanian book reviewer promoting African literature.'),
    ('Sandra Appiah', 'SandyCooks', 'Ghanaian chef sharing traditional West African recipes.'),
    ('Tunde Bakare', 'TundeTech', 'Nigerian gadget reviewer and consumer tech expert.'),
    ('Uma Diop', 'UmaArt', 'Senegalese contemporary artist showcasing African creativity.'),
    ('Victor Onyeka', 'VicMotivates', 'Nigerian life coach and podcast host on personal development.'),
    ('Wanjiku Kimani', 'WanjikuWrites', 'Kenyan author and storytelling advocate.'),
    ('Yemi Adebayo', 'YemiDance', 'Nigerian choreographer teaching Afrobeats dance worldwide.'),
    ('Zara Nkemelu', 'ZaraGlow', 'Nigerian skincare specialist promoting natural remedies.'),
    ('Abdul Rashid', 'AbdulVlogs', 'Ghanaian daily vlogger sharing authentic African life.'),
    ('Binta Camara', 'BintaCrafts', 'Guinean artisan showcasing traditional African craftsmanship.'),
    ('Charles Obi', 'CharlieReviews', 'Nigerian movie critic covering Nollywood and African cinema.'),
    ('Diana Awuor', 'DianaKE', 'Kenyan lifestyle and parenting content creator.')
) AS names(full_name, alias, bio);

-- Recreate the trigger for future real creators
CREATE OR REPLACE FUNCTION public.handle_new_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert role if user_id exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'creator')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_creator_created
  AFTER INSERT ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_creator();