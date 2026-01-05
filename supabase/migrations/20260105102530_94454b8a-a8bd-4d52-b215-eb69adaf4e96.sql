-- Drop the handle_new_creator trigger temporarily
DROP TRIGGER IF EXISTS on_creator_created ON public.creators;

-- Drop the user_id foreign key constraint
ALTER TABLE public.creators DROP CONSTRAINT IF EXISTS creators_user_id_fkey;

-- Insert demo nominees with randomized votes (500-10,000)
INSERT INTO public.creators (user_id, full_name, alias, email, phone, bio, category_id, profile_photo_url, vote_count, is_approved, is_active, instagram_url, twitter_url, youtube_url, tiktok_url, website_url)
VALUES
(gen_random_uuid(), 'Amara Okonkwo', 'TechAmara', 'amara.demo@acia.test', '+254711000001', 'Tech enthusiast sharing the latest innovations from Africa.', 'f3691db6-4cf6-4c45-ad07-a328789cb2d7', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 8547, true, true, 'https://instagram.com/techamara', 'https://twitter.com/techamara', 'https://youtube.com/@techamara', NULL, 'https://techamara.com'),
(gen_random_uuid(), 'Kwame Mensah', 'AfroBeatsKing', 'kwame.demo@acia.test', '+254711000002', 'Afrobeats producer and artist. Music is my language.', '3da32ba9-035f-49e2-9ed4-33e8a44328f4', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 7234, true, true, 'https://instagram.com/afrobeatsking', 'https://twitter.com/afrobeatsking', 'https://youtube.com/@afrobeatsking', 'https://tiktok.com/@afrobeatsking', NULL),
(gen_random_uuid(), 'Fatou Diallo', 'FunnyFatou', 'fatou.demo@acia.test', '+254711000003', 'Making Africa laugh one video at a time!', '7c7b7438-1ce7-4002-8fd0-293da70bcb5b', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400', 9821, true, true, 'https://instagram.com/funnyfatou', NULL, 'https://youtube.com/@funnyfatou', 'https://tiktok.com/@funnyfatou', NULL),
(gen_random_uuid(), 'Thabo Molefe', 'LifeWithThabo', 'thabo.demo@acia.test', '+254711000004', 'Lifestyle creator showcasing African excellence.', 'ae8efa32-b45c-463b-b64b-01725c75b3e5', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 5432, true, true, 'https://instagram.com/lifewiththabo', 'https://twitter.com/lifewiththabo', NULL, NULL, 'https://lifewiththabo.co.za'),
(gen_random_uuid(), 'Zainab Hassan', 'StyleByZee', 'zainab.demo@acia.test', '+254711000005', 'Fashion designer celebrating African prints and style.', '15fa101d-0147-4bfd-ad7a-7538fb3f573a', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 6789, true, true, 'https://instagram.com/stylebyzee', 'https://twitter.com/stylebyzee', NULL, 'https://tiktok.com/@stylebyzee', 'https://stylebyzee.com'),
(gen_random_uuid(), 'Olumide Adeyemi', 'LearnWithOlu', 'olumide.demo@acia.test', '+254711000006', 'Educator empowering African youth through learning.', '9a8c6acc-1981-4f86-8e50-80d626e47525', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 4567, true, true, 'https://instagram.com/learnwitholu', 'https://twitter.com/learnwitholu', 'https://youtube.com/@learnwitholu', NULL, NULL),
(gen_random_uuid(), 'Grace Wanjiku', 'FitGrace', 'grace.demo@acia.test', '+254711000007', 'Fitness coach empowering Africans to live healthier.', 'cec1127d-d6fd-478d-8902-8baab2533b1a', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 3456, true, true, 'https://instagram.com/fitgrace', NULL, 'https://youtube.com/@fitgrace', 'https://tiktok.com/@fitgrace', NULL),
(gen_random_uuid(), 'Emmanuel Nkrumah', 'BizWithEmma', 'emmanuel.demo@acia.test', '+254711000008', 'Entrepreneur sharing business insights for African startups.', '14e202f3-58f9-454e-b26f-2a490cfe1d0f', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 6123, true, true, 'https://instagram.com/bizwithemma', 'https://twitter.com/bizwithemma', 'https://youtube.com/@bizwithemma', NULL, 'https://bizwithemma.com'),
(gen_random_uuid(), 'Chioma Eze', 'CodeQueenChi', 'chioma.demo@acia.test', '+254711000009', 'Software developer advocating for women in African tech.', 'f3691db6-4cf6-4c45-ad07-a328789cb2d7', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 7890, true, true, 'https://instagram.com/codequeenchi', 'https://twitter.com/codequeenchi', NULL, NULL, 'https://codequeenchi.dev'),
(gen_random_uuid(), 'Sekou Traore', 'MaliMelody', 'sekou.demo@acia.test', '+254711000010', 'Bringing Malian music to the world stage.', '3da32ba9-035f-49e2-9ed4-33e8a44328f4', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', 5678, true, true, 'https://instagram.com/malimelody', 'https://twitter.com/malimelody', 'https://youtube.com/@malimelody', NULL, NULL);

-- Re-add the trigger
CREATE TRIGGER on_creator_created
  AFTER INSERT ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_creator();