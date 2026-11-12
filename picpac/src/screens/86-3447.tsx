import React from "react";
const assetPathPrefix = "/assets";
const img = `${assetPathPrefix}/2e7db.png`;
const imgBack = `${assetPathPrefix}/9d936.svg`;
const imgPrint = `${assetPathPrefix}/5a0eb.svg`;
const imgNext = `${assetPathPrefix}/333f9.svg`;
const imgBell = `${assetPathPrefix}/e4138.svg`;
const imgTag = `${assetPathPrefix}/285a6.svg`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f217 f1 f2 f3 f4" data-node-id="86:3447" data-name="PicPac · Прототип / 1.2 · Уведомления · Бренд v2">
      <a className="f5 f802 f6 f694 f803 f37 f7 f32 f1 f804 f805 f11" data-node-id="86:3448" data-name="Назад">
        <div className="f5 f806 f807 f808" data-node-id="86:3449" data-name="back">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
        </div>
      </a>
      <p className="f60 f52 f5 f53 f480 f61 f55 f56 f811 f58 f1110 f294 f1111" data-node-id="86:3451">
        Уведомления
      </p>
      <div className="f5 f93 f1112 f32 f1 f262 f1113 f1114" data-node-id="86:3452" data-name="Все">
        <p className="f60 f52 f5 f165 f480 f1115 f55 f1116 f58 f103 f1117 f1114" data-node-id="86:3453">
          Все
        </p>
      </div>
      <div className="f5 f1044 f1112 f1118 f1 f262 f1113 f1119" data-node-id="86:3454" data-name="Заказы">
        <p className="f60 f52 f5 f165 f480 f1120 f55 f56 f1116 f58 f1117 f1119" data-node-id="86:3455">
          Заказы
        </p>
      </div>
      <p className="f52 f5 f53 f480 f32 f55 f56 f1121 f719 f1122" data-node-id="86:3456">
        Сегодня
      </p>
      <a className="f5 f1123 f6 f7 f1124 f48 f1 f1125 f1126 f930" data-node-id="86:3457" data-name="Заказ уже в печати">
        <div className="f5 f1127 f1128 f1087 f1129 f1130" data-node-id="86:3458" data-name="Новое" />
        <div className="f5 f1131 f261 f1 f1132 f1133 f1134" data-node-id="86:3459" data-name="Тип уведомления">
          <div className="f5 f1135 f1136 f1130" data-node-id="86:3460" data-name="print">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgPrint} />
          </div>
        </div>
        <p className="f52 f5 f53 f480 f1137 f55 f56 f1138 f135 f1139 f1140" data-node-id="86:3462">
          Заказ уже в печати
        </p>
        <div className="f52 f5 f165 f100 f138 f1137 f968 f1141 f135 f1142 f1143" data-node-id="86:3463" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          <p className="f480 f142">Фотокнига «Лето внутри»</p>
          <p className="f480">перешла в статус «В печати».</p>
        </div>
        <p className="f52 f5 f165 f100 f480 f1137 f968 f1144 f135 f1145 f825" data-node-id="86:3464" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Заказ №6403839 · 12:40
        </p>
        <div className="f5 f1146 f1147 f1087 f251 f1148" data-node-id="86:3465" data-name="Превью заказа">
          <div className="f5 f12 f13 f14 f1087">
            <img alt="" className="f5 f1099 f1100 f17 f1101 f745" src={img} />
          </div>
        </div>
        <div className="f5 f1149 f1150 f1151" data-node-id="86:3466" data-name="next">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgNext} />
        </div>
      </a>
      <p className="f52 f5 f53 f480 f32 f55 f56 f1121 f1152 f1122" data-node-id="86:3468">
        Вчера
      </p>
      <div className="f5 f802 f694 f803 f37 f273 f48 f1 f1125 f1153 f930" data-node-id="86:3469" data-name="Настройки уведомлений">
        <p className="f52 f5 f53 f480 f1154 f55 f56 f1059 f1005 f1155" data-node-id="86:3470">
          Настройки уведомлений
        </p>
        <div className="f5 f1156 f1157 f1158" data-node-id="86:3471" data-name="bell">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBell} />
        </div>
        <p className="f52 f5 f165 f480 f1159 f55 f56 f1160 f1161 f1162" data-node-id="86:3473">
          Статусы заказов
        </p>
        <div className="f5 f45 f1163 f1164 f1 f1165 f1166 f1167" data-node-id="86:3474" data-name="Статусы заказов — переключатель">
          <div className="f5 f34 f1168 f275 f1157 f1169" data-node-id="86:3475" data-name="Бегунок" />
        </div>
        <div className="f5 f781 f1170 f1171 f1172 f1173" data-node-id="86:3476" data-name="Разделитель" />
        <div className="f5 f1156 f1157 f1174" data-node-id="86:3477" data-name="tag">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgTag} />
        </div>
        <p className="f52 f5 f165 f480 f1159 f55 f56 f1160 f1175 f1162" data-node-id="86:3479">
          Новости и акции
        </p>
        <div className="f5 f1176 f1163 f1164 f1 f1165 f1177 f1167" data-node-id="86:3480" data-name="Новости и акции — переключатель">
          <div className="f5 f34 f1178 f275 f1157 f1169" data-node-id="86:3481" data-name="Бегунок" />
        </div>
      </div>
      <div className="f5 f196 f176 f173 f1 f177 f145" data-node-id="86:3482" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f180 f82 f310" data-node-id="86:3483">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:3484" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:3485" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:3486" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:3487" data-name="Сотовая связь" />
        <div className="f5 f196 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:3488" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:3489" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:3490" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:3491" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <div className="f60 f5 f93 f215 f208 f61 f201 f216" data-node-id="86:3494" data-name="iOS · Индикатор домой" />
      <div className="f5 f1179 f48 f1 f1180 f150" data-node-id="86:3495" data-name="Текущий статус">
        <div className="f5 f1181 f1179 f173 f396 f145 f150" data-node-id="86:3496" data-name="Статус заказа" />
        <p className="f52 f5 f53 f84 f848 f433 f56 f849 f65 f448" data-node-id="86:3497" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Получен · спасибо за заказ!
        </p>
        <p className="f52 f5 f53 f84 f453 f433 f56 f454 f870 f448" data-node-id="86:3498" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Заказ №6403805 · фотографии
        </p>
        <p className="f52 f5 f165 f1182 f433 f55 f391 f1183 f1184 f310" data-node-id="86:3499">
          Фотографии уже у вас. Сохраним эти моменты.
        </p>
      </div>
      <div className="f5 f1185 f48 f1 f1186 f150" data-node-id="86:3500" data-name="Предложение отзыва">
        <div className="f5 f837 f1185 f173 f396 f145 f150" data-node-id="86:3501" data-name="Приглашение оставить отзыв" />
        <p className="f52 f5 f53 f848 f433 f55 f56 f849 f49 f448" data-node-id="86:3502">
          Как вам фотографии?
        </p>
        <div className="f52 f5 f165 f138 f433 f55 f56 f270 f820 f310" data-node-id="86:3503">
          <p className="f1187 f142">Расскажите о печати и доставке.</p>
          <p className="f1187">Ваш отзыв поможет нам стать лучше</p>
        </div>
        <div className="f5 f62 f433 f517" data-node-id="86:3504">
          <a className="f5 f93 f6 f7 f1188 f433 f109 f517 f448" data-node-id="86:3505" data-name="Оставить отзыв" />
          <p className="f60 f52 f5 f53 f446 f462 f55 f447 f58 f103 f904 f842" data-node-id="86:3506">
            Оставить отзыв
          </p>
        </div>
      </div>
      <div className="f5 f176 f32 f1 f1189 f150" data-node-id="86:3507" data-name="Действие">
        <a className="f5 f802 f6 f35 f36 f37 f7 f176 f173 f1190 f145 f150" data-node-id="86:3508" data-name="Связаться по заказу" />
        <p className="f60 f52 f5 f53 f446 f462 f55 f1191 f447 f58 f65 f294 f463" data-node-id="86:3509">
          Связаться с нами
        </p>
      </div>
    </div>
  );
}
