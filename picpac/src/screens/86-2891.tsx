import React from "react";
const assetPathPrefix = "/assets";
const img2 = `${assetPathPrefix}/6532e.png`;
const imgBack = `${assetPathPrefix}/c22e3.svg`;
const imgUndo = `${assetPathPrefix}/80af3.svg`;
const imgRedo = `${assetPathPrefix}/c6b21.svg`;
const imgPhoto = `${assetPathPrefix}/c26d6.svg`;
const imgBack1 = `${assetPathPrefix}/b4cfe.svg`;
const imgNext = `${assetPathPrefix}/3a552.svg`;
const imgPhoto1 = `${assetPathPrefix}/40788.svg`;
const imgGrid = `${assetPathPrefix}/0973d.svg`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f0 f1 f2 f3 f4" data-node-id="86:2891" data-name="PicPac · Прототип / 2.1.4 · Редактор фотокниги · Бренд v2">
      <a className="f5 f147 f6 f7 f32 f1 f505 f506 f11" data-node-id="86:2892" data-name="Назад">
        <div className="f5 f507 f508 f509" data-node-id="86:2893" data-name="back">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
        </div>
      </a>
      <p className="f52 f5 f53 f510 f511 f55 f56 f512 f513 f294 f514" data-node-id="86:2895">
        Лето внутри
      </p>
      <p className="f52 f5 f53 f84 f510 f515 f269 f516 f517 f518" data-node-id="86:2896" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
        ✓ Сохранено
      </p>
      <a className="f5 f93 f6 f7 f519 f520 f1 f521 f11 f522" data-node-id="86:2897" data-name="Далее →">
        <p className="f60 f52 f5 f53 f84 f510 f523 f524 f58 f103 f525 f522" data-node-id="86:2898" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Далее →
        </p>
      </a>
      <div className="f5 f477 f526 f527" data-node-id="86:2899" data-name="undo">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgUndo} />
      </div>
      <div className="f5 f528 f526 f527" data-node-id="86:2901" data-name="redo">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgRedo} />
      </div>
      <div className="f52 f5 f53 f84 f138 f529 f269 f516 f530 f531" data-node-id="86:2903" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
        <p className="f453 f142">Classic · 20 × 20 см</p>
        <p className="f453">10 разворотов</p>
      </div>
      <div className="f5 f532 f32 f533 f534 f535" data-node-id="86:2904" data-name="Разворот 2 — морское побережье">
        <div className="f5 f12 f13 f14 f533">
          <img alt="" className="f5 f536 f537 f17 f538 f539" src={img2} />
        </div>
      </div>
      <div className="f5 f36 f540 f37 f541 f477 f1 f542 f543" data-node-id="86:2905" data-name="Выбранное фото">
        <div className="f5 f34 f36 f544 f37 f545 f546 f547 f548" data-node-id="86:2906" data-name="Маркер изменения размера" />
        <div className="f5 f34 f36 f544 f37 f549 f546 f547 f548" data-node-id="86:2907" data-name="Маркер изменения размера" />
        <div className="f5 f34 f36 f544 f37 f545 f546 f547 f550" data-node-id="86:2908" data-name="Маркер изменения размера" />
        <div className="f5 f34 f36 f544 f37 f549 f546 f547 f550" data-node-id="86:2909" data-name="Маркер изменения размера" />
      </div>
      <div className="f5 f147 f551 f552 f1 f553 f554 f555" data-node-id="86:2910" data-name="Заменить фото">
        <p className="f60 f52 f5 f53 f510 f556 f55 f56 f524 f58 f557 f555" data-node-id="86:2911">
          Заменить фото
        </p>
        <div className="f5 f32 f558 f559" data-node-id="86:2912" data-name="photo">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgPhoto} />
        </div>
      </div>
      <p className="f60 f52 f5 f53 f510 f560 f55 f56 f516 f58 f561 f562" data-node-id="86:2914">
        Разворот 2 из 10
      </p>
      <div className="f5 f563 f508 f564" data-node-id="86:2915" data-name="back">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgBack1} />
      </div>
      <div className="f5 f565 f508 f564" data-node-id="86:2917" data-name="next">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgNext} />
      </div>
      <div className="f5 f566 f567 f546 f568 f569" data-node-id="86:2919" data-name="Миниатюра разворота 1">
        <div className="f5 f12 f13 f14 f546">
          <img alt="" className="f5 f570 f571 f17 f572 f573" src={img2} />
        </div>
      </div>
      <div className="f5 f566 f139 f546 f568 f574" data-node-id="86:2920" data-name="Миниатюра разворота 2">
        <div className="f5 f12 f13 f14 f546">
          <img alt="" className="f5 f575 f576 f17 f577 f578" src={img2} />
        </div>
      </div>
      <div className="f5 f566 f579 f546 f568 f569" data-node-id="86:2921" data-name="Миниатюра разворота 3">
        <div className="f5 f12 f13 f14 f546">
          <img alt="" className="f5 f580 f581 f17 f582 f583" src={img2} />
        </div>
      </div>
      <div className="f5 f147 f584 f585 f32 f1 f586 f553" data-node-id="86:2922" data-name="Инструменты редактора">
        <div className="f5 f587 f588 f557" data-node-id="86:2923" data-name="photo">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgPhoto1} />
        </div>
        <p className="f60 f52 f5 f53 f510 f589 f55 f56 f590 f58 f591 f592" data-node-id="86:2925">
          Фото
        </p>
        <div className="f5 f593 f588 f557" data-node-id="86:2926" data-name="grid">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgGrid} />
        </div>
        <p className="f60 f52 f5 f53 f510 f594 f55 f56 f590 f58 f591 f592" data-node-id="86:2928">
          Макет
        </p>
        <p className="f52 f5 f53 f510 f595 f55 f56 f596 f597 f310" data-node-id="86:2929">
          T
        </p>
        <p className="f60 f52 f5 f53 f510 f598 f55 f56 f590 f58 f591 f592" data-node-id="86:2930">
          Текст
        </p>
        <p className="f52 f5 f53 f84 f510 f599 f56 f596 f597 f600" data-node-id="86:2931" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          ▧
        </p>
        <p className="f60 f52 f5 f53 f510 f85 f55 f56 f590 f58 f591 f592" data-node-id="86:2932">
          Фон
        </p>
      </div>
      <div className="f5 f0 f176 f173 f1 f177 f145" data-node-id="86:2933" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f313 f82 f181" data-node-id="86:2934">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:2935" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:2936" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:2937" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:2938" data-name="Сотовая связь" />
        <div className="f5 f0 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:2939" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:2940" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:2941" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:2942" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <div className="f52 f5 f147 f53 f601 f32 f1 f396 f602 f150" data-node-id="86:2946" data-name="Расчёт стоимости фотокниги">
        <p className="f5 f446 f433 f55 f56 f447 f78 f448" data-node-id="86:2947">
          Расчёт стоимости
        </p>
        <p className="f5 f84 f457 f433 f391 f450 f385 f603" data-node-id="86:2948" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Classic · 20 страниц / 10 разворотов
        </p>
        <p className="f496 f5 f457 f604 f55 f56 f450 f498 f385 f605" data-node-id="86:2949">
          72,90 BYN
        </p>
        <p className="f5 f84 f457 f433 f391 f450 f606 f603" data-node-id="86:2950" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Доп. развороты · 0 шт.
        </p>
        <p className="f496 f5 f457 f604 f55 f56 f450 f498 f606 f607" data-node-id="86:2951">
          + 0,00 BYN
        </p>
        <p className="f5 f446 f433 f55 f56 f447 f517 f608" data-node-id="86:2952">
          Итого за фотокнигу
        </p>
        <p className="f496 f5 f609 f604 f55 f56 f610 f498 f611 f612" data-node-id="86:2953">
          72,90 BYN
        </p>
        <p className="f5 f84 f613 f433 f391 f614 f615 f448" data-node-id="86:2954" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          За 1 экземпляр · доставка рассчитывается отдельно
        </p>
      </div>
    </div>
  );
}
