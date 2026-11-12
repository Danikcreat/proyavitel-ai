import React from "react";
const assetPathPrefix = "/assets";
const img = `${assetPathPrefix}/6532e.png`;
const imgPicPac = `${assetPathPrefix}/1308e.png`;
const img1 = `${assetPathPrefix}/63b7d.png`;
const img2 = `${assetPathPrefix}/bcf16.png`;
const img3 = `${assetPathPrefix}/b5691.png`;
const img4 = `${assetPathPrefix}/bbaf5.png`;
const img5 = `${assetPathPrefix}/e158f.png`;
const imgBell = `${assetPathPrefix}/a0f90.svg`;
const imgGroup = `${assetPathPrefix}/538bc.svg`;
const imgGroup1 = `${assetPathPrefix}/b7ce9.svg`;
const imgGroup2 = `${assetPathPrefix}/d1f57.svg`;
const imgGroup3 = `${assetPathPrefix}/4a6e5.svg`;
const imgBookmark = `${assetPathPrefix}/9b7c2.svg`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgUnion = `${assetPathPrefix}/66795.svg`;
const imgPlus = `${assetPathPrefix}/3352c.svg`;
const imgHome = `${assetPathPrefix}/67f46.svg`;
const imgGroup8 = `${assetPathPrefix}/a3091.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f0 f1 f2 f3 f4" data-node-id="86:2514" data-name="PicPac · Прототип / 2 · Выбор продукта · Бренд v2">
      <a className="f5 f6 f7 f8 f9 f10 f11" data-node-id="86:2515" data-name="Аватар Анны">
        <div className="f5 f12 f13 f14 f9">
          <img alt="" className="f5 f15 f16 f17 f18 f19" src={img} />
        </div>
      </a>
      <div className="f5 f20 f21 f22 f23" data-node-id="86:2516" data-name="PicPac · Официальный логотип">
        <img alt="" className="f5 f12 f17 f24 f14 f4" src={imgPicPac} />
      </div>
      <a className="f5 f6 f7 f25 f26 f27" data-node-id="86:2517" data-name="bell">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgBell} />
      </a>
      <div className="f5 f28 f29 f30 f31 f32 f33" data-node-id="86:2519">
        <div className="f34 f35 f36 f37 f28 f29 f38 f39 f31 f40 f1 f41 f2 f42 f43 f44" data-node-id="86:2520">
          <div className="f45 f1 f2 f46 f43 f47" data-node-id="86:2521" data-name="Новинки">
            <div className="f5 f48 f1 f26 f49" data-node-id="86:2522" data-name="andrsrxn:sparkle">
              <div className="f5 f50" data-node-id="86:2523" data-name="Group">
                <div className="f5 f51">
                  <img alt="" className="f6 f17 f4" src={imgGroup} />
                </div>
              </div>
            </div>
          </div>
          <p className="f52 f53 f54 f55 f2 f43 f56 f57 f58 f44" data-node-id="86:2526">
            Новинки
          </p>
        </div>
        <div className="f34 f35 f36 f37 f28 f29 f38 f39 f31 f40 f1 f41 f2 f42 f43 f44" data-node-id="86:2527">
          <div className="f59 f1 f2 f46 f43 f47" data-node-id="86:2528" data-name="Идеи">
            <div className="f60 f5 f61 f1 f26 f49" data-node-id="86:2529" data-name="cuida:lamp-outline">
              <div className="f5 f62 f63" data-node-id="86:2530" data-name="Group">
                <div className="f5 f63" data-node-id="86:2531" data-name="Group">
                  <img alt="" className="f5 f6 f12 f17 f4" src={imgGroup1} />
                </div>
              </div>
            </div>
          </div>
          <p className="f52 f53 f54 f55 f2 f43 f56 f57 f58 f44" data-node-id="86:2534">
            Идеи
          </p>
        </div>
        <div className="f34 f35 f36 f37 f28 f29 f38 f39 f31 f40 f1 f41 f2 f42 f43 f44" data-node-id="86:2535">
          <div className="f64 f1 f2 f46 f43 f47" data-node-id="86:2536" data-name="Отзывы">
            <div className="f5 f48 f1 f26 f65" data-node-id="86:2537" data-name="iconoven:customer-review">
              <div className="f5 f66" data-node-id="86:2538" data-name="Group">
                <div className="f5 f67">
                  <img alt="" className="f6 f17 f4" src={imgGroup2} />
                </div>
              </div>
            </div>
          </div>
          <p className="f52 f53 f54 f55 f2 f43 f56 f57 f58 f44" data-node-id="86:2541">
            Отзывы
          </p>
        </div>
        <div className="f34 f35 f36 f37 f28 f29 f38 f39 f31 f40 f1 f41 f2 f42 f43 f44" data-node-id="86:2542">
          <div className="f45 f1 f2 f46 f43 f47" data-node-id="86:2543" data-name="Акции">
            <div className="f60 f68 f5 f61 f1 f26 f69" data-node-id="86:2544" data-name="andrsrxn:sale">
              <div className="f5 f70" data-node-id="86:2545" data-name="Group">
                <div className="f5 f71">
                  <img alt="" className="f6 f17 f4" src={imgGroup3} />
                </div>
              </div>
            </div>
          </div>
          <p className="f52 f53 f54 f55 f2 f43 f56 f57 f58 f44" data-node-id="86:2550">
            Акции
          </p>
        </div>
      </div>
      <div className="f5 f34 f72 f36 f37 f73 f32 f1 f9 f74 f75" data-node-id="86:2551" data-name="Публикация PicPac">
        <div className="f5 f76 f77 f78 f79" data-node-id="86:2552" data-name="PicPac · Официальный логотип">
          <img alt="" className="f5 f12 f17 f24 f14 f4" src={imgPicPac} />
        </div>
        <p className="f52 f5 f53 f54 f80 f55 f56 f81 f82 f83" data-node-id="86:2553">
          Новый шаблон
        </p>
        <p className="f52 f5 f53 f84 f54 f85 f56 f86 f87 f88" data-node-id="86:2554" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          ···
        </p>
        <p className="f52 f5 f53 f54 f89 f55 f56 f90 f91 f92" data-node-id="86:2555">
          Ваше лето — в одной книге
        </p>
        <div className="f5 f93 f94 f95 f1 f96 f97 f98" data-node-id="86:2556" data-name="Попробовать шаблон →">
          <p className="f60 f52 f5 f99 f100 f54 f101 f102 f58 f103 f104 f98" data-node-id="86:2557" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Попробовать шаблон →
          </p>
        </div>
        <div className="f5 f62 f105 f106" data-node-id="86:2558">
          <div className="f5 f107 f108 f144 f110 f111" data-node-id="86:2559" data-name="Обложка «Наше лето»">
            <img alt="" className="f5 f12 f17 f112 f14 f144 f4" src={img1} />
          </div>
          <div className="f5 f34 f113 f114 f115 f116 f117" data-node-id="86:2560" data-name="Индикатор 0" />
          <div className="f5 f118 f113 f119 f115 f116 f117" data-node-id="86:2561" data-name="Индикатор 1" />
          <div className="f5 f118 f113 f120 f115 f116 f117" data-node-id="86:2562" data-name="Индикатор 2" />
          <div className="f5 f118 f113 f121 f115 f116 f117" data-node-id="86:2563" data-name="Индикатор 3" />
          <div className="f5 f34 f122 f239 f1 f124 f240 f126" data-node-id="86:2564" data-name="bookmark">
            <div className="f5 f127 f128 f104" data-node-id="86:2565" data-name="bookmark">
              <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark} />
            </div>
          </div>
        </div>
      </div>
      <div className="f5 f129 f130 f32 f1 f96 f131 f132" data-node-id="86:2567" data-name="Скидка на первую фотокнигу">
        <p className="f52 f5 f53 f54 f133 f55 f134 f103 f136 f137" data-node-id="86:2568">
          −15%
        </p>
        <div className="f52 f5 f53 f138 f139 f55 f102 f103 f140 f141" data-node-id="86:2569">
          <p className="f54 f142">на первую</p>
          <p className="f54">фотокнигу</p>
        </div>
        <div className="f5 f130 f143 f144 f145 f146" data-node-id="86:2570" data-name="Розовая фотокнига">
          <img alt="" className="f5 f12 f17 f112 f14 f144 f4" src={img2} />
        </div>
      </div>
      <div className="f5 f147 f72 f36 f37 f148 f32 f1 f9 f149 f150" data-node-id="86:2571" data-name="Отзыв Анны">
        <div className="f5 f151 f152 f153 f154" data-node-id="86:2572" data-name="Анна">
          <div className="f5 f12 f13 f14 f152">
            <img alt="" className="f5 f155 f156 f17 f157 f158" src={img} />
          </div>
        </div>
        <p className="f52 f5 f53 f54 f159 f55 f56 f102 f160 f161" data-node-id="86:2573">
          Анна
        </p>
        <p className="f52 f5 f53 f84 f54 f162 f163 f102 f160 f164" data-node-id="86:2574" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          ★★★★★
        </p>
        <div className="f52 f5 f165 f138 f159 f55 f56 f102 f166 f167" data-node-id="86:2575">
          <p className="f168 f142">Такие воспоминания</p>
          <p className="f168">хочется листать</p>
        </div>
        <div className="f5 f169 f170 f144 f171 f132" data-node-id="86:2576" data-name="Разворот фотокниги">
          <div className="f5 f12 f13 f14 f144">
            <img alt="" className="f5 f172 f173 f17 f174 f175" src={img3} />
          </div>
        </div>
      </div>
      <div className="f5 f176 f173 f1 f177 f145" data-node-id="86:2577" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f180 f82 f181" data-node-id="86:2578">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:2579" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:2580" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:2581" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:2582" data-name="Сотовая связь" />
        <div className="f5 f196 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:2583" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:2584" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:2585" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:2586" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <div className="f60 f5 f93 f215 f208 f61 f201 f216" data-node-id="86:2589" data-name="iOS · Индикатор домой" />
      <a className="f5 f241 f6 f7 f242 f173 f243 f145 f221" data-node-id="86:2590" data-name="Затемнение под меню" />
      <div className="f5 f0 f244 f173 f1 f245 f246 f221" data-node-id="86:2591" data-name="Что создадим?">
        <div className="f5 f247 f248 f249 f250 f251 f252" data-node-id="86:2592" data-name="Индикатор панели" />
        <p className="f52 f5 f53 f54 f253 f55 f56 f254 f255 f256" data-node-id="86:2593">
          Что создадим?
        </p>
        <p className="f52 f5 f99 f54 f253 f55 f56 f257 f258 f259" data-node-id="86:2594">
          Сохраните любимые моменты
        </p>
        <a className="f5 f59 f6 f7 f260 f261 f1 f262 f263 f264" data-node-id="86:2595" data-name="Фотокнига">
          <p className="f52 f5 f53 f54 f265 f55 f56 f266 f135 f267 f268" data-node-id="86:2596">
            Фотокнига
          </p>
          <div className="f52 f5 f99 f100 f138 f265 f269 f270 f135 f271 f272" data-node-id="86:2597" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            <p className="f54 f142">Premium · Lite</p>
            <p className="f54">Classic</p>
          </div>
          <div className="f5 f273 f274 f275 f276 f277" data-node-id="86:2598" data-name="Фотокнига — фото">
            <img alt="" className="f5 f12 f17 f112 f14 f275 f4" src={img4} />
          </div>
        </a>
        <a className="f5 f64 f6 f7 f260 f261 f1 f262 f278 f264" data-node-id="86:2599" data-name="Фотопечать">
          <p className="f52 f5 f53 f54 f265 f55 f56 f266 f135 f267 f268" data-node-id="86:2600">
            Фотопечать
          </p>
          <div className="f52 f5 f99 f100 f138 f265 f269 f279 f135 f271 f272" data-node-id="86:2601" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            <p className="f54 f142">10 × 15 см</p>
            <p className="f54">от 0,55 BYN</p>
          </div>
          <div className="f5 f280 f281 f275 f282 f283" data-node-id="86:2602" data-name="Фотопечать — фото">
            <img alt="" className="f5 f12 f17 f112 f14 f275 f4" src={img5} />
          </div>
        </a>
      </div>
      <div className="f60 f5 f222 f61 f223 f150" data-node-id="86:2604">
        <div className="f60 f5 f62 f61 f145" data-node-id="86:2605">
          <div className="f5 f222 f173 f145 f150" data-node-id="86:2606" data-name="Union">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgUnion} />
          </div>
          <div className="f60 f5 f34 f198 f224 f37 f61 f1 f225 f226 f206" data-node-id="86:2609" data-name="Создать">
            <div className="f5 f29 f31 f40 f284 f285 f286" data-node-id="86:2610">
              <div className="f287 f288">
                <div className="f2 f228" data-name="plus">
                  <img alt="" className="f5 f6 f12 f17 f4" src={imgPlus} />
                </div>
              </div>
            </div>
          </div>
          <a className="f5 f62 f7 f230 f231" data-node-id="86:2612">
            <div className="f5 f45 f232 f230 f9 f231 f233" data-node-id="86:2613" data-name="Активная вкладка" />
            <div className="f5 f234 f235 f236" data-node-id="86:2614" data-name="home">
              <img alt="" className="f5 f6 f12 f17 f4" src={imgHome} />
            </div>
          </a>
          <a className="f5 f6 f7 f237" data-node-id="86:2616">
            <div className="f5 f238">
              <img alt="" className="f6 f17 f4" src={imgGroup8} />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
