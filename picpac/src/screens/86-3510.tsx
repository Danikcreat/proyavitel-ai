import React from "react";
const assetPathPrefix = "/assets";
const img = `${assetPathPrefix}/6532e.png`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgBack = `${assetPathPrefix}/9d936.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f217 f1 f2 f801 f4" data-node-id="86:3510" data-name="PicPac · Прототип / 1.1.2 · Отзыв о заказе · Бренд v2">
      <div className="f5 f196 f176 f173 f1 f177 f145" data-node-id="86:3511" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f454 f82 f713" data-node-id="86:3512">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:3513" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:3514" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:3515" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:3516" data-name="Сотовая связь" />
        <div className="f5 f196 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:3517" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:3518" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:3519" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:3520" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <a className="f5 f802 f6 f694 f803 f37 f7 f32 f1 f804 f805 f11" data-node-id="86:3523" data-name="Назад">
        <div className="f5 f806 f807 f808" data-node-id="86:3524" data-name="back">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
        </div>
      </a>
      <p className="f60 f52 f5 f53 f809 f178 f810 f55 f56 f811 f58 f623 f812" data-node-id="86:3527">
        Оставить отзыв
      </p>
      <div className="f5 f1179 f32 f1 f814 f150" data-node-id="86:3528" data-name="Состав заказа">
        <div className="f5 f802 f1179 f173 f396 f145 f150" data-node-id="86:3529" data-name="Полученный заказ" />
        <div className="f5 f48 f396 f1192 f82" data-node-id="86:3530" data-name="Фотографии заказа">
          <div className="f5 f12 f13 f14 f396">
            <img alt="" className="f5 f765 f743 f17 f766 f745" src={img} />
          </div>
        </div>
        <p className="f52 f5 f53 f84 f453 f1193 f56 f454 f213 f1194" data-node-id="86:3531" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Фотографии · заказ №6403805
        </p>
        <p className="f52 f5 f53 f84 f449 f1193 f391 f455 f870 f1194" data-node-id="86:3532" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          10 × 15 см · 3 шт.
        </p>
        <p className="f52 f5 f53 f449 f1193 f55 f1195 f455 f836 f1194" data-node-id="86:3533">
          Получен
        </p>
      </div>
      <div className="f52 f5 f53 f813 f32 f1 f1196 f150" data-node-id="86:3534" data-name="Оценка">
        <p className="f5 f484 f173 f55 f56 f486 f145 f150" data-node-id="86:3535">
          Ваша оценка
        </p>
        <p className="f5 f84 f449 f173 f391 f455 f1197 f150" data-node-id="86:3536" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          4 из 5 · хорошо
        </p>
        <div className="f5 f28 f29 f84 f767 f31 f1198 f1199 f173 f1 f1200 f1201 f1202 f150 f310" data-node-id="86:3537" data-name="Звёзды — на всю ширину">
          <p className="f2 f43" data-node-id="86:3538" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            ★
          </p>
          <p className="f2 f43" data-node-id="86:3539" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            ★
          </p>
          <p className="f2 f43" data-node-id="86:3540" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            ★
          </p>
          <p className="f2 f43" data-node-id="86:3541" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            ★
          </p>
          <p className="f2 f43" data-node-id="86:3542" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            ☆
          </p>
        </div>
      </div>
      <div className="f5 f927 f32 f1 f1203 f150" data-node-id="86:3543" data-name="Комментарий">
        <p className="f52 f5 f53 f453 f173 f55 f56 f454 f145 f150" data-node-id="86:3544">
          Что понравилось? Что можно улучшить?
        </p>
        <div className="f5 f802 f1204 f173 f396 f1205 f150" data-node-id="86:3545" data-name="Текст отзыва — поле ввода" />
        <div className="f52 f5 f53 f138 f433 f55 f391 f454 f1206 f448" data-node-id="86:3546">
          <p className="f453 f142">Расскажите о качестве печати, упаковке</p>
          <p className="f453 f142">и доставке — это поможет другим</p>
          <p className="f453">определиться с заказом.</p>
        </div>
      </div>
      <div className="f5 f1207 f32 f1 f1208 f150" data-node-id="86:3547" data-name="Фото">
        <div className="f5 f802 f1207 f173 f396 f145 f150" data-node-id="86:3548" data-name="Добавить фотографии к отзыву" />
        <p className="f52 f5 f53 f446 f433 f55 f56 f447 f202 f448 f843" data-node-id="86:3549">{`+  Добавить фото`}</p>
      </div>
      <div className="f5 f853 f32 f1 f854 f150" data-node-id="86:3550" data-name="Действие">
        <div className="f5 f93 f460 f173 f341 f145 f150" data-node-id="86:3551" data-name="Отправить отзыв" />
        <p className="f60 f52 f5 f53 f824 f462 f55 f180 f58 f103 f82 f463" data-node-id="86:3552">
          Отправить отзыв
        </p>
        <div className="f60 f52 f5 f53 f138 f462 f55 f391 f450 f58 f877 f150" data-node-id="86:3553">
          <p className="f449 f142">Отзыв публикуется после модерации.</p>
          <p className="f449">Личное название заказа не будет показано.</p>
        </div>
      </div>
    </div>
  );
}
