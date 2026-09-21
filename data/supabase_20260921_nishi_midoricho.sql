-- 横浜市西区「緑町」を戸部本町地域ケアプラザの担当に追加する
-- 市のPDF(0034_20260724)には緑町の記載がなく未割当だったが、
-- かながわ地域包括ケア支援システムでは戸部本町地域ケアプラザの担当地域に
-- 「…平沼1～2丁目、緑町、みなとみらい1～6丁目」と明記されている。
--   https://kana.rakuraku.or.jp/yokohama/nishi/cgsc
-- 隣接する桜木町・みなとみらいも同じケアプラザの担当。

update centers
   set area = '御所山町・戸部本町・戸部町5〜7丁目・桜木町・西戸部町3丁目・伊勢町3丁目の一部・中央1〜2丁目・西前町・藤棚町1丁目の一部・高島1〜2丁目・平沼1〜2丁目・緑町・みなとみらい1〜6丁目',
       confirmed_on = '2026-09-21'
 where city = '横浜市西区'
   and name = '横浜市戸部本町地域ケアプラザ';

-- 郵便番号検索(220-0013)でもヒットするよう対応表に追加
insert into center_zip_codes (center_id, postal_code)
select id, '2200013' from centers
 where city = '横浜市西区'
   and name = '横浜市戸部本町地域ケアプラザ'
   and not exists (
     select 1 from center_zip_codes z
      where z.center_id = centers.id and z.postal_code = '2200013'
   );

-- 確認用（緑町を含む担当地区と、220-0013 → 戸部本町 の1行が出ればOK）
select name, area, confirmed_on from centers
 where city = '横浜市西区' and name = '横浜市戸部本町地域ケアプラザ';
select c.name from center_zip_codes z join centers c on c.id = z.center_id
 where z.postal_code = '2200013';
