// Auto-generated icon filename mapping
// Maps database PNG filenames to actual PNG filenames in public/icons/png/avatars/

export const iconFilenameMapping: Record<string, string> = {
  '01arab_male_people_beard_islam_avatar_man.png': '01_Arab, male,  people, beard, Islam, avatar, man.png',
  '02boy_people_avatar_man_male_freckles_ginger.png': '02_boy, people, avatar, man, male, freckles, ginger.png',
  '03boy_people_avatar_man_male_hat_student.png': '03_boy, people, avatar, man, male, hat, student.png',
  '04boy_people_avatar_man_male_teenager_ear_piercing.png': '04_boy, people, avatar, man, male, teenager, ear piercing.png',
  '05boy_people_avatar_man_male_teenager_handsome_user.png': '05_boy, people, avatar, man, male, teenager, handsome, user.png',
  '06boy_people_avatar_man_male_teenager_handsome.png': '06_boy, people, avatar, man, male, teenager, handsome.png',
  '07boy_people_avatar_man_male_teenager_hood.png': '07_boy, people, avatar, man, male, teenager, hood.png',
  '08boy_people_avatar_man_male_teenager_portriat.png': '08_boy, people, avatar, man, male, teenager, portriat.png',
  '09boy_people_avatar_man_male_young_user.png': '09_boy, people, avatar, man, male, young, user.png',
  '10boy_people._avatar_man_afro_teenager_user.png': '10_boy, people. avatar, man, afro, teenager, user.png',
  '11boy_people._avatar_man_male_teenager_user.png': '11_boy, people. avatar, man, male, teenager, user.png',
  '12business_female_nurse_people_woman_doctor_avatar.png': '12_business, female, nurse, people, woman, doctor, avatar.png',
  '13businessman_people_avatar_man_male_employee_tie.png': '13_businessman, people, avatar, man, male, employee, tie.png',
  '14female_african_dreadlocks_girl_young_woman_avatar.png': '14_female, african, dreadlocks, girl, young, woman, avatar.png',
  '15girl_blonde_curl_people_woman_teenager_avatar.png': '15_girl, blonde, curl, people, woman, teenager, avatar.png',
  '16girl_blonde_pony_tail_people_woman_teenager_avatar.png': '16_girl, blonde, pony tail people, woman, teenager, avatar.png',
  '17girl_bobtay_people_woman_teenager_avatar_user.png': '17_girl, bobtay, people, woman, teenager, avatar, user.png',
  '18girl_chubby_beautiful_people_woman_lady_avatar.png': '18_girl, chubby, beautiful, people, woman, lady, avatar.png',
  '19girl_female_young_people_woman_teenager_avatar.png': '19_girl, female, young, people, woman, teenager, avatar.png',
  '20girl_ginger_curly_people_woman_teenager_avatar.png': '20_girl, ginger, curly , people, woman, teenager, avatar.png',
  '21girl_ginger_glasses_people_woman_teenager_avatar.png': '21_girl, ginger, glasses, people, woman, teenager, avatar.png',
  '22girl_islam_arab_people_woman_hijab_avatar.png': '22_girl, Islam, arab, people, woman, hijab, avatar.png',
  '23girl_long_hair_assiantant_people_woman_teenager_avatar.png': '23_girl, long hair, assiantant, people, woman, teenager, avatar.png',
  '24girl_long_hair_female_people_woman_user_avatar.png': '24_girl, long hair, female, people, woman, user, avatar.png',
  '25girl_ponytail_people_woman_teenager_avatar_cute.png': '25_girl, ponytail, people, woman, teenager, avatar, cute.png',
  '26girl_ponytail_people_woman_teenager_avatar_female.png': '26_girl, ponytail, people, woman, teenager, avatar, female.png',
  '27girl_ponytail_people_woman_teenager_avatar_portrait.png': '27_girl, ponytail, people, woman, teenager, avatar, portrait.png',
  '28girl_young_female_people_woman_teen_avatar.png': '28_girl, young, female, people, woman, teen, avatar.png',
  '29girl_young_female_people_woman_teenager_avatar.png': '29_girl, young, female, people, woman, teenager, avatar.png',
  '30glasses_businessman_people_male_man_avatar_blonde.png': '30_glasses, businessman, people, male, man, avatar, blonde.png',
  '31male_glasses_hacker_people_man_programmer_avatar.png': '31_male, glasses, hacker, people, man, programmer, avatar.png',
  '32male_leader_manager_people_man_boss_avatar.png': '32_male, leader, manager, people, man, boss, avatar.png',
  '33man_user_mustache_people_woman_male_avatar.png': '33_man, user, mustache, people, woman, male, avatar.png',
  '34old_glasses_people_man_grandfather_avatar_beard.png': '34_old, glasses, people, man, grandfather, avatar, beard.png',
  '35old_glasses_people_woman_grandmother_avatar_elderly.png': '35_old, glasses, people, woman, grandmother, avatar, elderly.png',
  '36skin_head_african_earring_girl_young_woman_avatar.png': '36_skin head, african, earring, girl, young, woman, avatar.png'
};

export function getLocalPngFilename(dbFilename: string): string | null {

  if (!baseName) return null;

  // eslint-disable-next-line security/detect-object-injection
  return iconFilenameMapping[pngName] || null;
}
