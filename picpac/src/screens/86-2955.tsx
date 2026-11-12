import React from "react";
const assetPathPrefix = "/assets";
const img = `${assetPathPrefix}/6532e.png`;
const imgBack = `${assetPathPrefix}/11025.svg`;
const imgCrop = `${assetPathPrefix}/8a02c.svg`;
const imgMinus = `${assetPathPrefix}/0d13e.svg`;
const imgPlus = `${assetPathPrefix}/53403.svg`;
const imgClose = `${assetPathPrefix}/9ab9c.svg`;
const imgClose1 = `${assetPathPrefix}/e89c5.svg`;
const imgClose2 = `${assetPathPrefix}/0afdc.svg`;
const imgPlus1 = `${assetPathPrefix}/050b8.svg`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgVector5 = `${assetPathPrefix}/a39a7.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f0 f1 f2 f3 f4" data-node-id="86:2955" data-name="PicPac · Прототип / 2.2.1 · Фотопечать — быстрая · Бренд v2">
      <a className="f5 f147 f6 f7 f32 f1 f616 f617 f11" data-node-id="86:2956" data-name="Назад">
        <div className="f5 f618 f619 f620" data-node-id="86:2957" data-name="back">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
        </div>
      </a>
      <p className="f60 f52 f5 f53 f510 f621 f55 f56 f622 f58 f623 f294 f476" data-node-id="86:2959">
        Фотопечать
      </p>
      <p className="f52 f5 f53 f84 f510 f624 f269 f625 f626 f627" data-node-id="86:2960" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
        ✓ Сохранено
      </p>
      <div className="f5 f628 f567 f629 f630 f631" data-node-id="86:2961" data-name="Кадрирование фотографии">
        <div className="f5 f12 f13 f14 f629">
          <img alt="" className="f5 f632 f633 f17 f634 f635" src={img} />
        </div>
      </div>
      <div className="f5 f36 f636 f37 f637 f638 f1 f639 f640" data-node-id="86:2962" data-name="Границы кадра">
        <div className="f5 f34 f637 f641 f642 f643 f644" data-node-id="86:2963" data-name="Сетка кадра" />
        <div className="f5 f34 f645 f646 f642 f647 f640" data-node-id="86:2964" data-name="Сетка кадра" />
        <div className="f5 f34 f637 f648 f642 f643 f644" data-node-id="86:2965" data-name="Сетка кадра" />
        <div className="f5 f34 f645 f646 f642 f649 f640" data-node-id="86:2966" data-name="Сетка кадра" />
      </div>
      <div className="f5 f34 f650 f1 f651 f617 f652" data-node-id="86:2967" data-name="Кадрировать">
        <div className="f5 f653 f654 f655" data-node-id="86:2968" data-name="crop">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgCrop} />
        </div>
      </div>
      <p className="f52 f5 f53 f510 f656 f55 f56 f657 f658 f659" data-node-id="86:2970">
        Копий
      </p>
      <div className="f5 f660 f661 f662 f1 f663 f664 f665" data-node-id="86:2971" data-name="Количество">
        <div className="f5 f653 f666 f655" data-node-id="86:2972" data-name="minus">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgMinus} />
        </div>
        <p className="f52 f5 f53 f510 f667 f55 f56 f668 f655 f669" data-node-id="86:2974">
          1
        </p>
        <div className="f5 f670 f666 f655" data-node-id="86:2975" data-name="plus">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgPlus} />
        </div>
      </div>
      <div className="f5 f36 f671 f37 f672 f673 f674 f675 f676" data-node-id="86:2977" data-name="Фотография 1">
        <div className="f5 f12 f13 f14 f674">
          <img alt="" className="f5 f677 f678 f17 f679 f680" src={img} />
        </div>
      </div>
      <div className="f5 f34 f681 f1 f682 f683 f684" data-node-id="86:2978" data-name="Удалить фото">
        <div className="f5 f685 f686 f687" data-node-id="86:2979" data-name="close">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgClose} />
        </div>
      </div>
      <div className="f5 f672 f688 f674 f675 f676" data-node-id="86:2981" data-name="Фотография 2">
        <div className="f5 f12 f13 f14 f674">
          <img alt="" className="f5 f677 f689 f17 f679 f680" src={img} />
        </div>
      </div>
      <div className="f5 f34 f690 f1 f682 f683 f684" data-node-id="86:2982" data-name="Удалить фото">
        <div className="f5 f685 f686 f687" data-node-id="86:2983" data-name="close">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgClose1} />
        </div>
      </div>
      <div className="f5 f672 f691 f674 f675 f676" data-node-id="86:2985" data-name="Фотография 3">
        <div className="f5 f12 f13 f14 f674">
          <img alt="" className="f5 f677 f692 f17 f679 f680" src={img} />
        </div>
      </div>
      <div className="f5 f34 f693 f1 f682 f683 f684" data-node-id="86:2986" data-name="Удалить фото">
        <div className="f5 f685 f686 f687" data-node-id="86:2987" data-name="close">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgClose2} />
        </div>
      </div>
      <div className="f5 f694 f636 f695 f672 f696 f1 f674 f675 f697" data-node-id="86:2989" data-name="Добавить фотографию">
        <div className="f5 f698 f619 f699" data-node-id="86:2990" data-name="plus">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgPlus1} />
        </div>
        <p className="f52 f5 f53 f510 f700 f55 f56 f701 f702 f703" data-node-id="86:2992">
          Добавить
        </p>
      </div>
      <p className="f52 f5 f53 f84 f510 f704 f56 f657 f494 f705" data-node-id="86:2993" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
        3 фото · 3 отпечатка
      </p>
      <p className="f496 f52 f5 f53 f510 f706 f55 f56 f707 f498 f708 f709" data-node-id="86:2994">
        1,65 BYN
      </p>
      <a className="f5 f93 f6 f7 f460 f32 f1 f710 f711 f150" data-node-id="86:2995" data-name="В корзину">
        <p className="f60 f52 f5 f53 f510 f462 f55 f712 f58 f103 f82 f150" data-node-id="86:2996">
          В корзину
        </p>
      </a>
      <div className="f5 f0 f176 f173 f1 f177 f145" data-node-id="86:2997" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f313 f82 f713" data-node-id="86:2998">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:2999" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:3000" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:3001" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:3002" data-name="Сотовая связь" />
        <div className="f5 f0 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:3003" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:3004" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:3005" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:3006" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <div className="f60 f52 f5 f53 f84 f138 f292 f269 f455 f58 f714 f715" data-node-id="86:3010" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
        <p className="f449 f142">10 × 15 — 0,55 · 15 × 20 — 1,35</p>
        <p className="f449">20 × 30 — 2,70 BYN за отпечаток</p>
      </div>
      <div className="f52 f5 f64 f36 f716 f37 f53 f717 f32 f1 f718 f56 f719 f720" data-node-id="86:3011" data-name="Фотохимическая — выбор вида печати">
        <p className="f5 f84 f721 f722 f723 f724 f725" data-node-id="86:3012" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          ● Фотохимическая
        </p>
        <div className="f5 f138 f722 f55 f458 f726 f725" data-node-id="86:3013">
          <p className="f457 f142">Экспонирование на фотобумаге</p>
          <p className="f457">и проявка. Плавные полутона.</p>
        </div>
      </div>
      <div className="f52 f5 f147 f197 f727 f37 f53 f717 f728 f1 f718 f56 f719 f720" data-node-id="86:3014" data-name="Цифровая — выбор вида печати">
        <p className="f5 f84 f721 f729 f723 f730 f725" data-node-id="86:3015" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          ○ Цифровая
        </p>
        <div className="f5 f138 f729 f55 f458 f731 f725" data-node-id="86:3016">
          <p className="f457 f142">Печать чернилами или тонером.</p>
          <p className="f457">Чёткие детали и графика.</p>
        </div>
      </div>
      <div className="f5 f298 f28 f29 f317 f318 f31 f40 f567 f1 f319 f320 f321 f732" data-node-id="86:3017" data-name="Все">
        <p className="f52 f53 f84 f510 f2 f43 f56 f668 f58 f733 f323" data-node-id="86:3018" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          10 × 15 см
        </p>
        <div className="f324 f2 f43 f325 f326" data-node-id="86:3019">
          <div className="f5 f327">
            <img alt="" className="f6 f17 f4" src={imgVector5} />
          </div>
        </div>
      </div>
      <div className="f5 f298 f28 f29 f317 f318 f31 f40 f734 f1 f319 f320 f321 f732" data-node-id="86:3020" data-name="Все">
        <p className="f52 f53 f510 f55 f2 f43 f56 f668 f58 f733 f323" data-node-id="86:3021">
          Матовая
        </p>
        <div className="f324 f2 f43 f325 f326" data-node-id="86:3022">
          <div className="f5 f327">
            <img alt="" className="f6 f17 f4" src={imgVector5} />
          </div>
        </div>
      </div>
      <div className="f5 f298 f28 f29 f317 f318 f31 f40 f735 f1 f319 f320 f321 f732" data-node-id="86:3023" data-name="Все">
        <p className="f52 f53 f510 f55 f2 f43 f56 f668 f58 f733 f323" data-node-id="86:3024">
          Без рамки
        </p>
        <div className="f324 f2 f43 f325 f326" data-node-id="86:3025">
          <div className="f5 f327">
            <img alt="" className="f6 f17 f4" src={imgVector5} />
          </div>
        </div>
      </div>
    </div>
  );
}
