import React from "react";
const assetPathPrefix = "/assets";
const imgPicPac = `${assetPathPrefix}/1308e.png`;
const imgPicPac1 = `${assetPathPrefix}/96848.png`;
const img = `${assetPathPrefix}/eb490.svg`;
const img1 = `${assetPathPrefix}/34dcd.svg`;
const img2 = `${assetPathPrefix}/f8e89.svg`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f0 f1 f2 f3 f4" data-node-id="86:2865" data-name="PicPac · Прототип / 2.1.3.2 · Загрузка — правая лапка · Бренд v2">
      <div className="f5 f464 f465 f466" data-node-id="86:2866" data-name="Жёлтый акцент">
        <img alt="" className="f5 f6 f12 f17 f4" src={img} />
      </div>
      <div className="f5 f467 f468 f469" data-node-id="86:2867" data-name="Лавандовый акцент">
        <img alt="" className="f5 f6 f12 f17 f4" src={img1} />
      </div>
      <div className="f5 f470 f471 f472" data-node-id="86:2868" data-name="Голубой акцент">
        <img alt="" className="f5 f6 f12 f17 f4" src={img2} />
      </div>
      <div className="f5 f473 f474 f475 f476" data-node-id="86:2869" data-name="PicPac · Официальный логотип">
        <img alt="" className="f5 f12 f17 f24 f14 f4" src={imgPicPac} />
      </div>
      <div className="f5 f108 f503 f504" data-node-id="86:2870" data-name="Котик PicPac — правая лапка">
        <img alt="" className="f5 f12 f17 f24 f14 f4" src={imgPicPac1} />
      </div>
      <p className="f60 f52 f5 f53 f480 f292 f55 f56 f481 f58 f482 f483" data-node-id="86:2871">
        Загружаем ваши фото
      </p>
      <p className="f60 f52 f5 f99 f484 f292 f55 f485 f486 f58 f487 f488" data-node-id="86:2872">
        Котик уже собирает ваши воспоминания
      </p>
      <div className="f5 f64 f489 f179 f490 f491 f463" data-node-id="86:2873" data-name="Дорожка прогресса" />
      <div className="f5 f45 f489 f179 f490 f491 f492" data-node-id="86:2874" data-name="Прогресс — 67%" />
      <p className="f52 f5 f53 f480 f179 f55 f56 f493 f494 f495" data-node-id="86:2875">
        8 из 12 фото
      </p>
      <p className="f496 f52 f5 f53 f480 f497 f55 f56 f493 f498 f494 f499" data-node-id="86:2876">
        67%
      </p>
      <p className="f60 f52 f5 f99 f480 f292 f55 f500 f501 f58 f502 f463" data-node-id="86:2877">
        Оставьте приложение открытым
      </p>
      <div className="f5 f0 f176 f173 f1 f177 f145" data-node-id="86:2878" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f180 f82 f310" data-node-id="86:2879">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:2880" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:2881" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:2882" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:2883" data-name="Сотовая связь" />
        <div className="f5 f0 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:2884" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:2885" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:2886" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:2887" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
    </div>
  );
}
