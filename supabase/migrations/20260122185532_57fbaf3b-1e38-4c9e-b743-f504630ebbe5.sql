
-- Insert 500 nominees with culturally appropriate names matching their countries
-- Random vote counts, with highest being 12000+

DO $$
DECLARE
  countries text[] := ARRAY['Kenya', 'Nigeria', 'Ghana', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda', 'Egypt', 'Ethiopia', 'Côte d''Ivoire', 'Senegal', 'Cameroon', 'Zambia', 'Zimbabwe', 'Botswana', 'Malawi', 'Mozambique', 'Angola', 'Morocco', 'Algeria', 'Tunisia', 'DR Congo', 'Mauritius', 'Namibia'];
  
  -- Kenyan names
  kenyan_first text[] := ARRAY['Kamau', 'Otieno', 'Wanjiku', 'Akinyi', 'Njeri', 'Omondi', 'Wairimu', 'Kipchoge', 'Chebet', 'Mutua', 'Mwangi', 'Odhiambo', 'Nyambura', 'Kibet', 'Wambui', 'Kimani', 'Adhiambo', 'Kiptoo', 'Jebet', 'Musyoka', 'Githinji', 'Auma', 'Cherono', 'Wafula', 'Nekesa'];
  kenyan_last text[] := ARRAY['Mwangi', 'Ochieng', 'Kimani', 'Onyango', 'Njoroge', 'Owino', 'Wanjiru', 'Kosgei', 'Rotich', 'Mutiso', 'Kariuki', 'Ouma', 'Wambua', 'Cheruiyot', 'Kamau', 'Ngugi', 'Atieno', 'Kiprop', 'Jepkosgei', 'Kioko'];
  
  -- Nigerian names
  nigerian_first text[] := ARRAY['Chukwuemeka', 'Ngozi', 'Oluwaseun', 'Adaeze', 'Obinna', 'Chidinma', 'Olumide', 'Amara', 'Chidi', 'Nneka', 'Emeka', 'Adaora', 'Tunde', 'Folake', 'Segun', 'Yetunde', 'Damilola', 'Bukola', 'Babatunde', 'Omolara', 'Ikenna', 'Chiamaka', 'Ayodele', 'Funke', 'Chinedu'];
  nigerian_last text[] := ARRAY['Okonkwo', 'Adeyemi', 'Nwosu', 'Ogundimu', 'Eze', 'Adeleke', 'Okoro', 'Balogun', 'Nnamdi', 'Oladipo', 'Uche', 'Afolabi', 'Chukwu', 'Oyelaran', 'Obi', 'Adebayo', 'Nnadi', 'Olawale', 'Igwe', 'Akande'];
  
  -- Ghanaian names
  ghanaian_first text[] := ARRAY['Kwame', 'Akua', 'Kofi', 'Ama', 'Yaw', 'Abena', 'Kwesi', 'Efua', 'Kwaku', 'Adjoa', 'Kojo', 'Akosua', 'Kwabena', 'Afia', 'Nana', 'Adwoa', 'Kwadwo', 'Afua', 'Yaa', 'Ebo', 'Ekow', 'Araba', 'Fiifi', 'Adoma', 'Koby'];
  ghanaian_last text[] := ARRAY['Mensah', 'Asante', 'Osei', 'Agyeman', 'Boateng', 'Owusu', 'Appiah', 'Amoah', 'Badu', 'Danso', 'Acheampong', 'Ofori', 'Asamoah', 'Gyasi', 'Tetteh', 'Annan', 'Opoku', 'Frimpong', 'Yeboah', 'Darko'];
  
  -- South African names
  sa_first text[] := ARRAY['Thabo', 'Naledi', 'Sipho', 'Lerato', 'Bongani', 'Nomvula', 'Mandla', 'Thandiwe', 'Sibusiso', 'Lindiwe', 'Themba', 'Palesa', 'Sandile', 'Khanyi', 'Vusi', 'Mpho', 'Jabu', 'Zinhle', 'Lucky', 'Nandi', 'Bheki', 'Andile', 'Ntombi', 'Thabiso', 'Bontle'];
  sa_last text[] := ARRAY['Ndlovu', 'Nkosi', 'Dlamini', 'Zulu', 'Mokoena', 'Molefe', 'Mthembu', 'Khumalo', 'Ngcobo', 'Mbeki', 'Buthelezi', 'Cele', 'Radebe', 'Modise', 'Tau', 'Ngwenya', 'Sithole', 'Maseko', 'Mahlangu', 'Zwane'];
  
  -- Ugandan names
  ugandan_first text[] := ARRAY['Ssemakula', 'Nakato', 'Wasswa', 'Babirye', 'Kato', 'Nalwoga', 'Mukasa', 'Nakabugo', 'Okiror', 'Akello', 'Ssekandi', 'Nambi', 'Muwonge', 'Namusoke', 'Okello', 'Auma', 'Kakembo', 'Nantongo', 'Ssenyonjo', 'Namazzi', 'Kiggundu', 'Namukasa', 'Lubega', 'Nankya', 'Byaruhanga'];
  ugandan_last text[] := ARRAY['Museveni', 'Ssali', 'Namugera', 'Kateregga', 'Ssemwanga', 'Nakitto', 'Lubwama', 'Nakaweesi', 'Kasozi', 'Nsubuga', 'Mukiibi', 'Nabukenya', 'Kiwanuka', 'Namuyomba', 'Ssentamu', 'Nakabuye', 'Mayanja', 'Nakayenga', 'Ssebunya', 'Nalukenge'];
  
  -- Tanzanian names
  tanzanian_first text[] := ARRAY['Juma', 'Zawadi', 'Hassan', 'Rehema', 'Bakari', 'Zainab', 'Hamisi', 'Amina', 'Rashid', 'Fatuma', 'Salim', 'Halima', 'Mwinyi', 'Saida', 'Abdallah', 'Mwanaisha', 'Omari', 'Khadija', 'Selemani', 'Maryam', 'Ally', 'Aisha', 'Mtumwa', 'Rukia', 'Issa'];
  tanzanian_last text[] := ARRAY['Mwinyi', 'Kikwete', 'Mkapa', 'Nyerere', 'Karume', 'Salum', 'Msuya', 'Shayo', 'Massawe', 'Kimaro', 'Shirima', 'Mwakasege', 'Mbwambo', 'Mchome', 'Tarimo', 'Lyimo', 'Mrema', 'Mushi', 'Tesha', 'Urassa'];
  
  -- Rwandan names
  rwandan_first text[] := ARRAY['Uwimana', 'Mutesi', 'Habimana', 'Uwase', 'Nshimiyimana', 'Mukamana', 'Ndayisaba', 'Umutoni', 'Hakizimana', 'Ingabire', 'Nsengimana', 'Uwera', 'Bizimana', 'Uwineza', 'Mugabo', 'Umuhoza', 'Niyonzima', 'Uwamahoro', 'Tuyisenge', 'Mukeshimana', 'Ishimwe', 'Iradukunda', 'Shema', 'Izere', 'Dusabe'];
  rwandan_last text[] := ARRAY['Kagame', 'Uwimana', 'Nkurunziza', 'Habimana', 'Ndayisaba', 'Niyonzima', 'Mugisha', 'Uwase', 'Hakizimana', 'Mukamana', 'Bizimungu', 'Ingabire', 'Rutagarama', 'Umutoni', 'Nsengimana', 'Uwineza', 'Nzeyimana', 'Mukeshimana', 'Gasana', 'Karenzi'];
  
  -- Egyptian names
  egyptian_first text[] := ARRAY['Ahmed', 'Fatima', 'Mohamed', 'Nadia', 'Mahmoud', 'Heba', 'Omar', 'Mona', 'Youssef', 'Dina', 'Khaled', 'Rania', 'Tarek', 'Amira', 'Hesham', 'Laila', 'Sherif', 'Sara', 'Amr', 'Noha', 'Karim', 'Yasmin', 'Wael', 'Mariam', 'Hany'];
  egyptian_last text[] := ARRAY['El-Sayed', 'Hassan', 'Ibrahim', 'Mostafa', 'Ali', 'Mahmoud', 'Abdel-Rahman', 'Farouk', 'Nasser', 'Saeed', 'El-Masry', 'Helmy', 'Fahmy', 'Shawky', 'El-Din', 'Ragab', 'Tawfik', 'Zaki', 'Saleh', 'Gaber'];
  
  -- Ethiopian names
  ethiopian_first text[] := ARRAY['Abebe', 'Tigist', 'Bekele', 'Hiwot', 'Getachew', 'Meron', 'Teshome', 'Selamawit', 'Haile', 'Birtukan', 'Tadesse', 'Almaz', 'Dawit', 'Hanna', 'Girma', 'Meseret', 'Kebede', 'Rahel', 'Mulugeta', 'Tsehay', 'Yonas', 'Bezawit', 'Tesfaye', 'Kidist', 'Ermias'];
  ethiopian_last text[] := ARRAY['Gebrselassie', 'Bekele', 'Dibaba', 'Regassa', 'Tadesse', 'Abera', 'Wolde', 'Defar', 'Keino', 'Tulu', 'Gebremedhin', 'Haile', 'Assefa', 'Mengistu', 'Teferi', 'Kebede', 'Desta', 'Negash', 'Girma', 'Alemayehu'];
  
  -- Ivorian names
  ivorian_first text[] := ARRAY['Kouassi', 'Aya', 'Yao', 'Adjoua', 'Koffi', 'Lou', 'Kouame', 'Amenan', 'Seydou', 'Ahou', 'Ouattara', 'Affou', 'Traore', 'Akissi', 'Diabate', 'Assata', 'Coulibaly', 'Amoin', 'Toure', 'Akoua', 'Kone', 'Adjo', 'Bamba', 'Yasmina', 'Diallo'];
  ivorian_last text[] := ARRAY['Ouattara', 'Coulibaly', 'Kone', 'Traore', 'Diallo', 'Bamba', 'Toure', 'Diabate', 'Kouyate', 'Doumbia', 'Sangare', 'Fofana', 'Cisse', 'Keita', 'Sissoko', 'Dembele', 'Sylla', 'Camara', 'Bakayoko', 'Soro'];
  
  -- Senegalese names
  senegalese_first text[] := ARRAY['Moussa', 'Fatou', 'Ibrahima', 'Aminata', 'Mamadou', 'Aissatou', 'Ousmane', 'Mariama', 'Abdoulaye', 'Khady', 'Cheikh', 'Astou', 'Modou', 'Coumba', 'Babacar', 'Ndeye', 'Pape', 'Mame', 'Alioune', 'Sokhna', 'Lamine', 'Rokhaya', 'Serigne', 'Rama', 'Mbacke'];
  senegalese_last text[] := ARRAY['Diop', 'Ndiaye', 'Fall', 'Sow', 'Diallo', 'Faye', 'Gueye', 'Thiam', 'Ba', 'Mbaye', 'Diouf', 'Sarr', 'Cisse', 'Ndoye', 'Kane', 'Sy', 'Wade', 'Sene', 'Camara', 'Tall'];
  
  -- Cameroonian names
  cameroonian_first text[] := ARRAY['Jean-Pierre', 'Marie', 'Samuel', 'Clarisse', 'Emmanuel', 'Prudence', 'Patrick', 'Gisele', 'François', 'Solange', 'Roger', 'Bernadette', 'Thierry', 'Jeanne', 'Michel', 'Charlotte', 'Pierre', 'Martine', 'Andre', 'Pauline', 'Claude', 'Sylvie', 'Jacques', 'Nicole', 'Paul'];
  cameroonian_last text[] := ARRAY['Eto''o', 'Mbappé', 'Nkoulou', 'Mbia', 'Song', 'Matip', 'Onana', 'Choupo-Moting', 'Aboubakar', 'Njie', 'Kunde', 'Bassogog', 'Ekambi', 'Toko', 'Ngadeu', 'Fai', 'Oyongo', 'Siani', 'Djoum', 'Hongla'];
  
  -- Zambian names
  zambian_first text[] := ARRAY['Bwalya', 'Mutale', 'Mwamba', 'Chanda', 'Musonda', 'Mulenga', 'Tembo', 'Chisala', 'Banda', 'Kaluba', 'Phiri', 'Nachilala', 'Zulu', 'Kapata', 'Lungu', 'Mumba', 'Chipata', 'Mwila', 'Ng''andu', 'Chola', 'Simukonda', 'Namwila', 'Sichone', 'Chilufya', 'Mubanga'];
  zambian_last text[] := ARRAY['Kaunda', 'Chiluba', 'Mwanawasa', 'Banda', 'Sata', 'Lungu', 'Mwamba', 'Phiri', 'Tembo', 'Zulu', 'Bwalya', 'Musonda', 'Chanda', 'Mulenga', 'Ng''andu', 'Chipata', 'Kaluba', 'Mumba', 'Simukonda', 'Sichone'];
  
  -- Zimbabwean names
  zimbabwean_first text[] := ARRAY['Tendai', 'Rudo', 'Tatenda', 'Chenai', 'Tapiwa', 'Nyasha', 'Kudakwashe', 'Chipo', 'Tafadzwa', 'Rumbidzai', 'Farai', 'Rutendo', 'Tinashe', 'Memory', 'Knowledge', 'Blessing', 'Precious', 'Patience', 'Simba', 'Rufaro', 'Gift', 'Faith', 'Trust', 'Hope', 'Liberty'];
  zimbabwean_last text[] := ARRAY['Mugabe', 'Mnangagwa', 'Moyo', 'Ndlovu', 'Ncube', 'Dube', 'Mpofu', 'Sibanda', 'Tshuma', 'Nyathi', 'Chigumba', 'Makoni', 'Mutasa', 'Charamba', 'Chiwenga', 'Chombo', 'Zhuwao', 'Kasukuwere', 'Matemadanda', 'Shiri'];
  
  -- Botswana names
  botswana_first text[] := ARRAY['Keabetswe', 'Lorato', 'Kgomotso', 'Neo', 'Thato', 'Mpho', 'Kagiso', 'Lesego', 'Phenyo', 'Bontle', 'Tumelo', 'Refilwe', 'Tshepiso', 'Gorata', 'Masego', 'Atang', 'Oratile', 'Lame', 'Tebogo', 'Gaone', 'Onalenna', 'Motheo', 'Malebogo', 'Kelebogile', 'Omphile'];
  botswana_last text[] := ARRAY['Khama', 'Masire', 'Mogae', 'Seretse', 'Molefe', 'Motsumi', 'Mosweu', 'Ratsoma', 'Kgosiemang', 'Setshwantsho', 'Mosimane', 'Pheto', 'Motswagole', 'Seakgosing', 'Gaolatlhe', 'Mokgosi', 'Moeti', 'Segokgo', 'Mmolawa', 'Olebile'];
  
  -- Malawian names
  malawian_first text[] := ARRAY['Chikondi', 'Tawonga', 'Blessings', 'Tadala', 'Chimwemwe', 'Mayamiko', 'Kondwani', 'Thandie', 'Yamikani', 'Mphatso', 'Limbani', 'Tiyamike', 'Dalitso', 'Temwa', 'Chisomo', 'Wongani', 'Pemphero', 'Zikomo', 'Mwayi', 'Lonjezo', 'Chifundo', 'Yankho', 'Fatsani', 'Taonga', 'Lusungu'];
  malawian_last text[] := ARRAY['Banda', 'Muluzi', 'Mutharika', 'Chakwera', 'Chilima', 'Kamwendo', 'Gondwe', 'Phiri', 'Nkhoma', 'Chirwa', 'Mhango', 'Msowoya', 'Ntata', 'Kachingwe', 'Kumwenda', 'Nyasulu', 'Tembo', 'Chisi', 'Mwale', 'Zimba'];
  
  -- Mozambican names
  mozambican_first text[] := ARRAY['Eduardo', 'Graca', 'Armando', 'Lurdes', 'Samora', 'Celina', 'Joaquim', 'Esperanca', 'Alberto', 'Jacinta', 'Fernando', 'Rosa', 'Carlos', 'Helena', 'Manuel', 'Ines', 'Antonio', 'Amelia', 'Jose', 'Francisca', 'Francisco', 'Maria', 'Paulo', 'Ana', 'Pedro'];
  mozambican_last text[] := ARRAY['Machel', 'Chissano', 'Guebuza', 'Nyusi', 'Dhlakama', 'Mondlane', 'Simango', 'Mazula', 'Mocumbi', 'Vieira', 'Diogo', 'Chipande', 'Mariano', 'Muteia', 'Baloi', 'Cossa', 'Nhaca', 'Tembe', 'Chamusso', 'Uamusse'];
  
  -- Angolan names
  angolan_first text[] := ARRAY['Agostinho', 'Luisa', 'Jose', 'Isabel', 'Joao', 'Ana', 'Antonio', 'Maria', 'Manuel', 'Rosa', 'Paulo', 'Helena', 'Pedro', 'Teresa', 'Domingos', 'Catarina', 'Francisco', 'Esperanca', 'Andre', 'Graca', 'Eduardo', 'Amelia', 'Fernando', 'Celina', 'Carlos'];
  angolan_last text[] := ARRAY['Neto', 'dos Santos', 'Lourenco', 'Savimbi', 'Mbundu', 'Kongo', 'Ovimbundu', 'Tchokwe', 'Ganguela', 'Lunda', 'Nyaneka', 'Umbundu', 'Kwanhama', 'Herero', 'Cuanhama', 'Ambo', 'Lucazi', 'Chokwe', 'Songo', 'Mbunda'];
  
  -- Moroccan names
  moroccan_first text[] := ARRAY['Mohammed', 'Fatima', 'Ahmed', 'Khadija', 'Youssef', 'Hafsa', 'Hassan', 'Zineb', 'Rachid', 'Nadia', 'Karim', 'Samira', 'Omar', 'Laila', 'Mehdi', 'Salma', 'Hamid', 'Naima', 'Said', 'Souad', 'Driss', 'Malika', 'Mustapha', 'Asmaa', 'Abdelkader'];
  moroccan_last text[] := ARRAY['Alaoui', 'Bennani', 'El Idrissi', 'Tazi', 'Fassi', 'Berrada', 'Chraibi', 'Alami', 'Benjelloun', 'Lahlou', 'El Amrani', 'Ouazzani', 'Benkirane', 'Kadiri', 'Cherkaoui', 'Sefrioui', 'Boutaleb', 'El Mansouri', 'Lahrichi', 'Tahiri'];
  
  -- Algerian names
  algerian_first text[] := ARRAY['Abdelaziz', 'Fatima', 'Mohamed', 'Aicha', 'Ahmed', 'Yamina', 'Karim', 'Djamila', 'Rachid', 'Nadia', 'Said', 'Samia', 'Omar', 'Leila', 'Hamid', 'Salima', 'Youssef', 'Houria', 'Mourad', 'Karima', 'Djamel', 'Malika', 'Sofiane', 'Nassima', 'Khaled'];
  algerian_last text[] := ARRAY['Bouteflika', 'Tebboune', 'Bendjelloul', 'Mammeri', 'Kateb', 'Camus', 'Brahimi', 'Djabou', 'Feghouli', 'Slimani', 'Mahrez', 'Bennacer', 'Atal', 'Bensebini', 'Ounas', 'Belaili', 'Guedioura', 'Bentaleb', 'Soudani', 'Hanni'];
  
  -- Tunisian names
  tunisian_first text[] := ARRAY['Mohamed', 'Fatma', 'Ahmed', 'Amel', 'Ali', 'Sonia', 'Karim', 'Leila', 'Habib', 'Rym', 'Hedi', 'Nadia', 'Slim', 'Ines', 'Nabil', 'Olfa', 'Fathi', 'Hajer', 'Khaled', 'Salma', 'Yassine', 'Sirine', 'Amine', 'Mariem', 'Wissem'];
  tunisian_last text[] := ARRAY['Bourguiba', 'Ben Ali', 'Essebsi', 'Saied', 'Jebali', 'Laaridh', 'Hamdi', 'Mzali', 'Sfar', 'Slim', 'Jaziri', 'Khazri', 'Sliti', 'Skhiri', 'Msakni', 'Ben Youssef', 'Sassi', 'Meriah', 'Bedoui', 'Chaalali'];
  
  -- DR Congo names
  drc_first text[] := ARRAY['Patrice', 'Marie', 'Joseph', 'Therese', 'Jean', 'Madeleine', 'Pierre', 'Josephine', 'Emmanuel', 'Esperance', 'Felix', 'Olive', 'Moise', 'Pascaline', 'Denis', 'Georgette', 'Etienne', 'Clementine', 'Roger', 'Beatrice', 'Albert', 'Christine', 'Francois', 'Jeannette', 'Claude'];
  drc_last text[] := ARRAY['Lumumba', 'Mobutu', 'Kabila', 'Tshisekedi', 'Kasa-Vubu', 'Mulele', 'Gizenga', 'Mbuyi', 'Bakajika', 'Nzuzi', 'Kasongo', 'Lukusa', 'Kabongo', 'Mutombo', 'Ilunga', 'Mbemba', 'Makusu', 'Kimbangu', 'Wemba', 'Olomide'];
  
  -- Mauritian names
  mauritian_first text[] := ARRAY['Raj', 'Priya', 'Anand', 'Lakshmi', 'Vikram', 'Sunita', 'Ashok', 'Meera', 'Ravi', 'Anjali', 'Sunil', 'Kavita', 'Anil', 'Neha', 'Sanjay', 'Deepa', 'Jean', 'Marie', 'Paul', 'Nicole', 'Olivier', 'Sophie', 'Yusuf', 'Fatima', 'Ibrahim'];
  mauritian_last text[] := ARRAY['Ramgoolam', 'Jugnauth', 'Berenger', 'Duval', 'Boolell', 'Sithanen', 'Cuttaree', 'Bunwaree', 'Gayan', 'Gokhool', 'Dulloo', 'Lutchmeenaraidoo', 'Bodha', 'Sawmynaden', 'Ganoo', 'Hurreeram', 'Collendavelloo', 'Sinatambou', 'Rutnah', 'Sesungkur'];
  
  -- Namibian names
  namibian_first text[] := ARRAY['Hifikepunye', 'Pendukeni', 'Sam', 'Ndeshi', 'Hage', 'Saara', 'Theo-Ben', 'Maria', 'Andimba', 'Netumbo', 'Nangolo', 'Doreen', 'Helmut', 'Libertina', 'Jerry', 'Sophia', 'Calle', 'Martha', 'Nahas', 'Emma', 'Utoni', 'Victoria', 'Albert', 'Frieda', 'Frans'];
  namibian_last text[] := ARRAY['Pohamba', 'Nujoma', 'Geingob', 'Angula', 'Gurirab', 'Iivula-Ithana', 'Nandi-Ndaitwah', 'Mbumba', 'Witbooi', 'Shilongo', 'Hamutenya', 'Nashandi', 'Kaura', 'Mudge', 'Garoeb', 'Diergaardt', 'Tjiriange', 'Haingura', 'Tweya', 'Shaningwa'];
  
  selected_country text;
  first_name text;
  last_name text;
  vote_count integer;
  alias text;
  creator_email text;
  category_ids uuid[];
  selected_category uuid;
  i integer;
BEGIN
  -- Get all category IDs
  SELECT array_agg(id) INTO category_ids FROM public.categories;
  
  FOR i IN 1..500 LOOP
    -- Select random country
    selected_country := countries[1 + floor(random() * array_length(countries, 1))::int];
    
    -- Select names based on country
    CASE selected_country
      WHEN 'Kenya' THEN
        first_name := kenyan_first[1 + floor(random() * array_length(kenyan_first, 1))::int];
        last_name := kenyan_last[1 + floor(random() * array_length(kenyan_last, 1))::int];
      WHEN 'Nigeria' THEN
        first_name := nigerian_first[1 + floor(random() * array_length(nigerian_first, 1))::int];
        last_name := nigerian_last[1 + floor(random() * array_length(nigerian_last, 1))::int];
      WHEN 'Ghana' THEN
        first_name := ghanaian_first[1 + floor(random() * array_length(ghanaian_first, 1))::int];
        last_name := ghanaian_last[1 + floor(random() * array_length(ghanaian_last, 1))::int];
      WHEN 'South Africa' THEN
        first_name := sa_first[1 + floor(random() * array_length(sa_first, 1))::int];
        last_name := sa_last[1 + floor(random() * array_length(sa_last, 1))::int];
      WHEN 'Uganda' THEN
        first_name := ugandan_first[1 + floor(random() * array_length(ugandan_first, 1))::int];
        last_name := ugandan_last[1 + floor(random() * array_length(ugandan_last, 1))::int];
      WHEN 'Tanzania' THEN
        first_name := tanzanian_first[1 + floor(random() * array_length(tanzanian_first, 1))::int];
        last_name := tanzanian_last[1 + floor(random() * array_length(tanzanian_last, 1))::int];
      WHEN 'Rwanda' THEN
        first_name := rwandan_first[1 + floor(random() * array_length(rwandan_first, 1))::int];
        last_name := rwandan_last[1 + floor(random() * array_length(rwandan_last, 1))::int];
      WHEN 'Egypt' THEN
        first_name := egyptian_first[1 + floor(random() * array_length(egyptian_first, 1))::int];
        last_name := egyptian_last[1 + floor(random() * array_length(egyptian_last, 1))::int];
      WHEN 'Ethiopia' THEN
        first_name := ethiopian_first[1 + floor(random() * array_length(ethiopian_first, 1))::int];
        last_name := ethiopian_last[1 + floor(random() * array_length(ethiopian_last, 1))::int];
      WHEN 'Côte d''Ivoire' THEN
        first_name := ivorian_first[1 + floor(random() * array_length(ivorian_first, 1))::int];
        last_name := ivorian_last[1 + floor(random() * array_length(ivorian_last, 1))::int];
      WHEN 'Senegal' THEN
        first_name := senegalese_first[1 + floor(random() * array_length(senegalese_first, 1))::int];
        last_name := senegalese_last[1 + floor(random() * array_length(senegalese_last, 1))::int];
      WHEN 'Cameroon' THEN
        first_name := cameroonian_first[1 + floor(random() * array_length(cameroonian_first, 1))::int];
        last_name := cameroonian_last[1 + floor(random() * array_length(cameroonian_last, 1))::int];
      WHEN 'Zambia' THEN
        first_name := zambian_first[1 + floor(random() * array_length(zambian_first, 1))::int];
        last_name := zambian_last[1 + floor(random() * array_length(zambian_last, 1))::int];
      WHEN 'Zimbabwe' THEN
        first_name := zimbabwean_first[1 + floor(random() * array_length(zimbabwean_first, 1))::int];
        last_name := zimbabwean_last[1 + floor(random() * array_length(zimbabwean_last, 1))::int];
      WHEN 'Botswana' THEN
        first_name := botswana_first[1 + floor(random() * array_length(botswana_first, 1))::int];
        last_name := botswana_last[1 + floor(random() * array_length(botswana_last, 1))::int];
      WHEN 'Malawi' THEN
        first_name := malawian_first[1 + floor(random() * array_length(malawian_first, 1))::int];
        last_name := malawian_last[1 + floor(random() * array_length(malawian_last, 1))::int];
      WHEN 'Mozambique' THEN
        first_name := mozambican_first[1 + floor(random() * array_length(mozambican_first, 1))::int];
        last_name := mozambican_last[1 + floor(random() * array_length(mozambican_last, 1))::int];
      WHEN 'Angola' THEN
        first_name := angolan_first[1 + floor(random() * array_length(angolan_first, 1))::int];
        last_name := angolan_last[1 + floor(random() * array_length(angolan_last, 1))::int];
      WHEN 'Morocco' THEN
        first_name := moroccan_first[1 + floor(random() * array_length(moroccan_first, 1))::int];
        last_name := moroccan_last[1 + floor(random() * array_length(moroccan_last, 1))::int];
      WHEN 'Algeria' THEN
        first_name := algerian_first[1 + floor(random() * array_length(algerian_first, 1))::int];
        last_name := algerian_last[1 + floor(random() * array_length(algerian_last, 1))::int];
      WHEN 'Tunisia' THEN
        first_name := tunisian_first[1 + floor(random() * array_length(tunisian_first, 1))::int];
        last_name := tunisian_last[1 + floor(random() * array_length(tunisian_last, 1))::int];
      WHEN 'DR Congo' THEN
        first_name := drc_first[1 + floor(random() * array_length(drc_first, 1))::int];
        last_name := drc_last[1 + floor(random() * array_length(drc_last, 1))::int];
      WHEN 'Mauritius' THEN
        first_name := mauritian_first[1 + floor(random() * array_length(mauritian_first, 1))::int];
        last_name := mauritian_last[1 + floor(random() * array_length(mauritian_last, 1))::int];
      WHEN 'Namibia' THEN
        first_name := namibian_first[1 + floor(random() * array_length(namibian_first, 1))::int];
        last_name := namibian_last[1 + floor(random() * array_length(namibian_last, 1))::int];
      ELSE
        first_name := kenyan_first[1 + floor(random() * array_length(kenyan_first, 1))::int];
        last_name := kenyan_last[1 + floor(random() * array_length(kenyan_last, 1))::int];
    END CASE;
    
    -- Generate random vote count (1-500, with one being 12000+)
    IF i = 1 THEN
      vote_count := 12000 + floor(random() * 1000)::int;
    ELSIF i <= 5 THEN
      vote_count := 5000 + floor(random() * 5000)::int;
    ELSIF i <= 20 THEN
      vote_count := 1000 + floor(random() * 3000)::int;
    ELSIF i <= 50 THEN
      vote_count := 500 + floor(random() * 1000)::int;
    ELSIF i <= 100 THEN
      vote_count := 200 + floor(random() * 500)::int;
    ELSE
      vote_count := floor(random() * 300)::int;
    END IF;
    
    -- Generate alias and email
    alias := first_name || '_' || i;
    creator_email := lower(first_name) || '.' || lower(last_name) || '.' || i || '@example.com';
    
    -- Select random category
    selected_category := category_ids[1 + floor(random() * array_length(category_ids, 1))::int];
    
    -- Insert creator
    INSERT INTO public.creators (
      full_name,
      alias,
      email,
      country,
      vote_count,
      category_id,
      is_approved,
      is_active,
      user_id,
      bio
    ) VALUES (
      first_name || ' ' || last_name,
      alias,
      creator_email,
      selected_country,
      vote_count,
      selected_category,
      true,
      true,
      gen_random_uuid(),
      'Content creator from ' || selected_country || ' creating amazing content.'
    );
  END LOOP;
END $$;
