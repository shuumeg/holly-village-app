-- 江東区・白河長寿サポートセンターの一時移転を住所に反映する
-- 出典: 江東区「白河長寿サポートセンターの一時移転」(2026年9月2日更新)
--       https://www.city.koto.lg.jp/211501/sirakawa.html
-- 大規模改修工事のため、令和8年11月から令和10年3月(予定)まで
-- 森下3-10-22 広瀬ビル1階へ一時移転する。電話番号とFax番号は変わらない。

update centers
   set address = '東京都江東区白河3-4-3 イーストコモンズ清澄白河2階（改修工事のため2026年11月〜2028年3月は森下3-10-22 広瀬ビル1階に一時移転）',
       confirmed_on = '2026-09-19'
 where city = '江東区'
   and name = '白河長寿サポートセンター';

-- 確認用
-- select name, postal_code, address, confirmed_on from centers
--  where city = '江東区' and name = '白河長寿サポートセンター';
