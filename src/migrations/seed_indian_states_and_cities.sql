-- Seed data for Indian States, Union Territories and Cities
-- This migration inserts all 28 Indian states, 8 Union Territories and major cities

-- Insert States
INSERT INTO `states` (`name`, `is_active`) VALUES
('Andhra Pradesh', 1),
('Arunachal Pradesh', 1),
('Assam', 1),
('Bihar', 1),
('Chhattisgarh', 1),
('Goa', 1),
('Gujarat', 1),
('Haryana', 1),
('Himachal Pradesh', 1),
('Jharkhand', 1),
('Karnataka', 1),
('Kerala', 1),
('Madhya Pradesh', 1),
('Maharashtra', 1),
('Manipur', 1),
('Meghalaya', 1),
('Mizoram', 1),
('Nagaland', 1),
('Odisha', 1),
('Punjab', 1),
('Rajasthan', 1),
('Sikkim', 1),
('Tamil Nadu', 1),
('Telangana', 1),
('Tripura', 1),
('Uttar Pradesh', 1),
('Uttarakhand', 1),
('West Bengal', 1),
-- Union Territories
('Andaman and Nicobar Islands', 1),
('Chandigarh', 1),
('Dadra and Nagar Haveli and Daman and Diu', 1),
('Delhi', 1),
('Jammu and Kashmir', 1),
('Ladakh', 1),
('Lakshadweep', 1),
('Puducherry', 1);

-- Insert Cities for each State
-- Andhra Pradesh
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Amaravati', 1 FROM states WHERE name = 'Andhra Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Visakhapatnam', 1 FROM states WHERE name = 'Andhra Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Vijayawada', 1 FROM states WHERE name = 'Andhra Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Guntur', 1 FROM states WHERE name = 'Andhra Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Nellore', 1 FROM states WHERE name = 'Andhra Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Rajahmundry', 1 FROM states WHERE name = 'Andhra Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kurnool', 1 FROM states WHERE name = 'Andhra Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Tirupati', 1 FROM states WHERE name = 'Andhra Pradesh';

-- Arunachal Pradesh
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Itanagar', 1 FROM states WHERE name = 'Arunachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Naharlagun', 1 FROM states WHERE name = 'Arunachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Pasighat', 1 FROM states WHERE name = 'Arunachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Tawang', 1 FROM states WHERE name = 'Arunachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bomdila', 1 FROM states WHERE name = 'Arunachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ziro', 1 FROM states WHERE name = 'Arunachal Pradesh';

-- Assam
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Dispur', 1 FROM states WHERE name = 'Assam';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Guwahati', 1 FROM states WHERE name = 'Assam';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Silchar', 1 FROM states WHERE name = 'Assam';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Dibrugarh', 1 FROM states WHERE name = 'Assam';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jorhat', 1 FROM states WHERE name = 'Assam';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Nagaon', 1 FROM states WHERE name = 'Assam';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Tinsukia', 1 FROM states WHERE name = 'Assam';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Tezpur', 1 FROM states WHERE name = 'Assam';

-- Bihar
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Patna', 1 FROM states WHERE name = 'Bihar';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Gaya', 1 FROM states WHERE name = 'Bihar';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bhagalpur', 1 FROM states WHERE name = 'Bihar';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Muzaffarpur', 1 FROM states WHERE name = 'Bihar';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Darbhanga', 1 FROM states WHERE name = 'Bihar';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Purnia', 1 FROM states WHERE name = 'Bihar';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Arrah', 1 FROM states WHERE name = 'Bihar';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Katihar', 1 FROM states WHERE name = 'Bihar';

-- Chhattisgarh
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Raipur', 1 FROM states WHERE name = 'Chhattisgarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bhilai', 1 FROM states WHERE name = 'Chhattisgarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bilaspur', 1 FROM states WHERE name = 'Chhattisgarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Durg', 1 FROM states WHERE name = 'Chhattisgarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Korba', 1 FROM states WHERE name = 'Chhattisgarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Raigarh', 1 FROM states WHERE name = 'Chhattisgarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jagdalpur', 1 FROM states WHERE name = 'Chhattisgarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ambikapur', 1 FROM states WHERE name = 'Chhattisgarh';

-- Goa
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Panaji', 1 FROM states WHERE name = 'Goa';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Margao', 1 FROM states WHERE name = 'Goa';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Vasco da Gama', 1 FROM states WHERE name = 'Goa';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mapusa', 1 FROM states WHERE name = 'Goa';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ponda', 1 FROM states WHERE name = 'Goa';

-- Gujarat
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Gandhinagar', 1 FROM states WHERE name = 'Gujarat';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ahmedabad', 1 FROM states WHERE name = 'Gujarat';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Surat', 1 FROM states WHERE name = 'Gujarat';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Vadodara', 1 FROM states WHERE name = 'Gujarat';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Rajkot', 1 FROM states WHERE name = 'Gujarat';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bhavnagar', 1 FROM states WHERE name = 'Gujarat';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jamnagar', 1 FROM states WHERE name = 'Gujarat';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Junagadh', 1 FROM states WHERE name = 'Gujarat';

-- Haryana
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Chandigarh', 1 FROM states WHERE name = 'Haryana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Faridabad', 1 FROM states WHERE name = 'Haryana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Gurgaon', 1 FROM states WHERE name = 'Haryana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Panipat', 1 FROM states WHERE name = 'Haryana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ambala', 1 FROM states WHERE name = 'Haryana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Yamunanagar', 1 FROM states WHERE name = 'Haryana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Rohtak', 1 FROM states WHERE name = 'Haryana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Karnal', 1 FROM states WHERE name = 'Haryana';

-- Himachal Pradesh
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Shimla', 1 FROM states WHERE name = 'Himachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mandi', 1 FROM states WHERE name = 'Himachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Solan', 1 FROM states WHERE name = 'Himachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Dharamshala', 1 FROM states WHERE name = 'Himachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kullu', 1 FROM states WHERE name = 'Himachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Manali', 1 FROM states WHERE name = 'Himachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Chamba', 1 FROM states WHERE name = 'Himachal Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bilaspur', 1 FROM states WHERE name = 'Himachal Pradesh';

-- Jharkhand
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ranchi', 1 FROM states WHERE name = 'Jharkhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jamshedpur', 1 FROM states WHERE name = 'Jharkhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Dhanbad', 1 FROM states WHERE name = 'Jharkhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bokaro', 1 FROM states WHERE name = 'Jharkhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Hazaribagh', 1 FROM states WHERE name = 'Jharkhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Giridih', 1 FROM states WHERE name = 'Jharkhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Deoghar', 1 FROM states WHERE name = 'Jharkhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ramgarh', 1 FROM states WHERE name = 'Jharkhand';

-- Karnataka
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bengaluru', 1 FROM states WHERE name = 'Karnataka';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mysuru', 1 FROM states WHERE name = 'Karnataka';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Hubli', 1 FROM states WHERE name = 'Karnataka';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mangalore', 1 FROM states WHERE name = 'Karnataka';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Belagavi', 1 FROM states WHERE name = 'Karnataka';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Gulbarga', 1 FROM states WHERE name = 'Karnataka';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Davangere', 1 FROM states WHERE name = 'Karnataka';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bellary', 1 FROM states WHERE name = 'Karnataka';

-- Kerala
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Thiruvananthapuram', 1 FROM states WHERE name = 'Kerala';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kochi', 1 FROM states WHERE name = 'Kerala';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kozhikode', 1 FROM states WHERE name = 'Kerala';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Thrissur', 1 FROM states WHERE name = 'Kerala';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kollam', 1 FROM states WHERE name = 'Kerala';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Alappuzha', 1 FROM states WHERE name = 'Kerala';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kannur', 1 FROM states WHERE name = 'Kerala';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kottayam', 1 FROM states WHERE name = 'Kerala';

-- Madhya Pradesh
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bhopal', 1 FROM states WHERE name = 'Madhya Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Indore', 1 FROM states WHERE name = 'Madhya Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Gwalior', 1 FROM states WHERE name = 'Madhya Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jabalpur', 1 FROM states WHERE name = 'Madhya Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ujjain', 1 FROM states WHERE name = 'Madhya Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Sagar', 1 FROM states WHERE name = 'Madhya Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ratlam', 1 FROM states WHERE name = 'Madhya Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Rewa', 1 FROM states WHERE name = 'Madhya Pradesh';

-- Maharashtra
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mumbai', 1 FROM states WHERE name = 'Maharashtra';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Pune', 1 FROM states WHERE name = 'Maharashtra';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Nagpur', 1 FROM states WHERE name = 'Maharashtra';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Aurangabad', 1 FROM states WHERE name = 'Maharashtra';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Nashik', 1 FROM states WHERE name = 'Maharashtra';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Solapur', 1 FROM states WHERE name = 'Maharashtra';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Amravati', 1 FROM states WHERE name = 'Maharashtra';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kolhapur', 1 FROM states WHERE name = 'Maharashtra';

-- Manipur
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Imphal', 1 FROM states WHERE name = 'Manipur';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Thoubal', 1 FROM states WHERE name = 'Manipur';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bishnupur', 1 FROM states WHERE name = 'Manipur';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Churachandpur', 1 FROM states WHERE name = 'Manipur';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ukhrul', 1 FROM states WHERE name = 'Manipur';

-- Meghalaya
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Shillong', 1 FROM states WHERE name = 'Meghalaya';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Tura', 1 FROM states WHERE name = 'Meghalaya';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jowai', 1 FROM states WHERE name = 'Meghalaya';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Nongpoh', 1 FROM states WHERE name = 'Meghalaya';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Williamnagar', 1 FROM states WHERE name = 'Meghalaya';

-- Mizoram
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Aizawl', 1 FROM states WHERE name = 'Mizoram';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Lunglei', 1 FROM states WHERE name = 'Mizoram';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Saiha', 1 FROM states WHERE name = 'Mizoram';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Champhai', 1 FROM states WHERE name = 'Mizoram';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kolasib', 1 FROM states WHERE name = 'Mizoram';

-- Nagaland
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kohima', 1 FROM states WHERE name = 'Nagaland';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Dimapur', 1 FROM states WHERE name = 'Nagaland';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mokokchung', 1 FROM states WHERE name = 'Nagaland';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Tuensang', 1 FROM states WHERE name = 'Nagaland';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Wokha', 1 FROM states WHERE name = 'Nagaland';

-- Odisha
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bhubaneswar', 1 FROM states WHERE name = 'Odisha';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Cuttack', 1 FROM states WHERE name = 'Odisha';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Rourkela', 1 FROM states WHERE name = 'Odisha';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Berhampur', 1 FROM states WHERE name = 'Odisha';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Sambalpur', 1 FROM states WHERE name = 'Odisha';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Puri', 1 FROM states WHERE name = 'Odisha';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Balasore', 1 FROM states WHERE name = 'Odisha';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bhadrak', 1 FROM states WHERE name = 'Odisha';

-- Punjab
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Chandigarh', 1 FROM states WHERE name = 'Punjab';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ludhiana', 1 FROM states WHERE name = 'Punjab';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Amritsar', 1 FROM states WHERE name = 'Punjab';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jalandhar', 1 FROM states WHERE name = 'Punjab';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Patiala', 1 FROM states WHERE name = 'Punjab';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bathinda', 1 FROM states WHERE name = 'Punjab';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mohali', 1 FROM states WHERE name = 'Punjab';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Hoshiarpur', 1 FROM states WHERE name = 'Punjab';

-- Rajasthan
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jaipur', 1 FROM states WHERE name = 'Rajasthan';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jodhpur', 1 FROM states WHERE name = 'Rajasthan';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kota', 1 FROM states WHERE name = 'Rajasthan';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bikaner', 1 FROM states WHERE name = 'Rajasthan';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ajmer', 1 FROM states WHERE name = 'Rajasthan';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Udaipur', 1 FROM states WHERE name = 'Rajasthan';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bhilwara', 1 FROM states WHERE name = 'Rajasthan';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Alwar', 1 FROM states WHERE name = 'Rajasthan';

-- Sikkim
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Gangtok', 1 FROM states WHERE name = 'Sikkim';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Namchi', 1 FROM states WHERE name = 'Sikkim';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mangan', 1 FROM states WHERE name = 'Sikkim';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Gyalshing', 1 FROM states WHERE name = 'Sikkim';

-- Tamil Nadu
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Chennai', 1 FROM states WHERE name = 'Tamil Nadu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Coimbatore', 1 FROM states WHERE name = 'Tamil Nadu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Madurai', 1 FROM states WHERE name = 'Tamil Nadu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Tiruchirappalli', 1 FROM states WHERE name = 'Tamil Nadu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Salem', 1 FROM states WHERE name = 'Tamil Nadu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Tirunelveli', 1 FROM states WHERE name = 'Tamil Nadu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Erode', 1 FROM states WHERE name = 'Tamil Nadu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Vellore', 1 FROM states WHERE name = 'Tamil Nadu';

-- Telangana
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Hyderabad', 1 FROM states WHERE name = 'Telangana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Warangal', 1 FROM states WHERE name = 'Telangana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Nizamabad', 1 FROM states WHERE name = 'Telangana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Karimnagar', 1 FROM states WHERE name = 'Telangana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ramagundam', 1 FROM states WHERE name = 'Telangana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Khammam', 1 FROM states WHERE name = 'Telangana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mahbubnagar', 1 FROM states WHERE name = 'Telangana';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Nalgonda', 1 FROM states WHERE name = 'Telangana';

-- Tripura
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Agartala', 1 FROM states WHERE name = 'Tripura';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Dharmanagar', 1 FROM states WHERE name = 'Tripura';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Udaipur', 1 FROM states WHERE name = 'Tripura';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kailasahar', 1 FROM states WHERE name = 'Tripura';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Belonia', 1 FROM states WHERE name = 'Tripura';

-- Uttar Pradesh
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Lucknow', 1 FROM states WHERE name = 'Uttar Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kanpur', 1 FROM states WHERE name = 'Uttar Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Agra', 1 FROM states WHERE name = 'Uttar Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Varanasi', 1 FROM states WHERE name = 'Uttar Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Allahabad', 1 FROM states WHERE name = 'Uttar Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Meerut', 1 FROM states WHERE name = 'Uttar Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ghaziabad', 1 FROM states WHERE name = 'Uttar Pradesh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Noida', 1 FROM states WHERE name = 'Uttar Pradesh';

-- Uttarakhand
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Dehradun', 1 FROM states WHERE name = 'Uttarakhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Haridwar', 1 FROM states WHERE name = 'Uttarakhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Roorkee', 1 FROM states WHERE name = 'Uttarakhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Haldwani', 1 FROM states WHERE name = 'Uttarakhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Rudrapur', 1 FROM states WHERE name = 'Uttarakhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kashipur', 1 FROM states WHERE name = 'Uttarakhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Rishikesh', 1 FROM states WHERE name = 'Uttarakhand';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Nainital', 1 FROM states WHERE name = 'Uttarakhand';

-- West Bengal
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kolkata', 1 FROM states WHERE name = 'West Bengal';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Howrah', 1 FROM states WHERE name = 'West Bengal';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Durgapur', 1 FROM states WHERE name = 'West Bengal';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Asansol', 1 FROM states WHERE name = 'West Bengal';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Siliguri', 1 FROM states WHERE name = 'West Bengal';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kharagpur', 1 FROM states WHERE name = 'West Bengal';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Bardhaman', 1 FROM states WHERE name = 'West Bengal';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Malda', 1 FROM states WHERE name = 'West Bengal';

-- Union Territories
-- Andaman and Nicobar Islands
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Port Blair', 1 FROM states WHERE name = 'Andaman and Nicobar Islands';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Diglipur', 1 FROM states WHERE name = 'Andaman and Nicobar Islands';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mayabunder', 1 FROM states WHERE name = 'Andaman and Nicobar Islands';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Rangat', 1 FROM states WHERE name = 'Andaman and Nicobar Islands';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Car Nicobar', 1 FROM states WHERE name = 'Andaman and Nicobar Islands';

-- Chandigarh
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Chandigarh', 1 FROM states WHERE name = 'Chandigarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Sector 17', 1 FROM states WHERE name = 'Chandigarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Sector 35', 1 FROM states WHERE name = 'Chandigarh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Manimajra', 1 FROM states WHERE name = 'Chandigarh';

-- Dadra and Nagar Haveli and Daman and Diu
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Silvassa', 1 FROM states WHERE name = 'Dadra and Nagar Haveli and Daman and Diu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Daman', 1 FROM states WHERE name = 'Dadra and Nagar Haveli and Daman and Diu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Diu', 1 FROM states WHERE name = 'Dadra and Nagar Haveli and Daman and Diu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Vapi', 1 FROM states WHERE name = 'Dadra and Nagar Haveli and Daman and Diu';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Naroli', 1 FROM states WHERE name = 'Dadra and Nagar Haveli and Daman and Diu';

-- Delhi
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'New Delhi', 1 FROM states WHERE name = 'Delhi';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Central Delhi', 1 FROM states WHERE name = 'Delhi';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'North Delhi', 1 FROM states WHERE name = 'Delhi';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'South Delhi', 1 FROM states WHERE name = 'Delhi';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'East Delhi', 1 FROM states WHERE name = 'Delhi';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'West Delhi', 1 FROM states WHERE name = 'Delhi';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'North East Delhi', 1 FROM states WHERE name = 'Delhi';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'North West Delhi', 1 FROM states WHERE name = 'Delhi';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'South West Delhi', 1 FROM states WHERE name = 'Delhi';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Shahdara', 1 FROM states WHERE name = 'Delhi';

-- Jammu and Kashmir
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Srinagar', 1 FROM states WHERE name = 'Jammu and Kashmir';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Jammu', 1 FROM states WHERE name = 'Jammu and Kashmir';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Anantnag', 1 FROM states WHERE name = 'Jammu and Kashmir';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Baramulla', 1 FROM states WHERE name = 'Jammu and Kashmir';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Udhampur', 1 FROM states WHERE name = 'Jammu and Kashmir';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kathua', 1 FROM states WHERE name = 'Jammu and Kashmir';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Pulwama', 1 FROM states WHERE name = 'Jammu and Kashmir';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Rajouri', 1 FROM states WHERE name = 'Jammu and Kashmir';

-- Ladakh
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Leh', 1 FROM states WHERE name = 'Ladakh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kargil', 1 FROM states WHERE name = 'Ladakh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Nubra Valley', 1 FROM states WHERE name = 'Ladakh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Zanskar', 1 FROM states WHERE name = 'Ladakh';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Drass', 1 FROM states WHERE name = 'Ladakh';

-- Lakshadweep
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kavaratti', 1 FROM states WHERE name = 'Lakshadweep';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Agatti', 1 FROM states WHERE name = 'Lakshadweep';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Amini', 1 FROM states WHERE name = 'Lakshadweep';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Andrott', 1 FROM states WHERE name = 'Lakshadweep';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kadmat', 1 FROM states WHERE name = 'Lakshadweep';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Kalpeni', 1 FROM states WHERE name = 'Lakshadweep';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Minicoy', 1 FROM states WHERE name = 'Lakshadweep';

-- Puducherry
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Puducherry', 1 FROM states WHERE name = 'Puducherry';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Karaikal', 1 FROM states WHERE name = 'Puducherry';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Mahe', 1 FROM states WHERE name = 'Puducherry';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Yanam', 1 FROM states WHERE name = 'Puducherry';
INSERT INTO `cities` (`state_id`, `name`, `is_active`) SELECT id, 'Ozhukarai', 1 FROM states WHERE name = 'Puducherry';
