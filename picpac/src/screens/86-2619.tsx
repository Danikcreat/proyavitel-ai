import React from "react";
const assetPathPrefix = "/assets";
const img = `${assetPathPrefix}/8ca4c.png`;
const img1 = `${assetPathPrefix}/689cc.png`;
const img2 = `${assetPathPrefix}/fd8ef.png`;
const img3 = `${assetPathPrefix}/7fb69.png`;
const img4 = `${assetPathPrefix}/bd681.png`;
const img5 = `${assetPathPrefix}/83f0b.png`;
const imgBack = `${assetPathPrefix}/73f82.svg`;
const imgBookmark = `${assetPathPrefix}/9b7c2.svg`;
const imgSearch = `${assetPathPrefix}/a1aec.svg`;
const imgFilter = `${assetPathPrefix}/8f450.svg`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgVector5 = `${assetPathPrefix}/a39a7.svg`;
const imgBookmark1 = `${assetPathPrefix}/43900.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f0 f1 f2 f3 f4" data-node-id="86:2619" data-name="PicPac · Прототип / 2.1.1 · Шаблоны фотокниг · Бренд v2">
      <a className="f5 f6 f7 f289 f290 f291" data-node-id="86:2620" data-name="back">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
      </a>
      <p className="f60 f52 f5 f53 f54 f292 f55 f56 f293 f58 f291 f294 f295" data-node-id="86:2622">
        Фотокниги
      </p>
      <div className="f5 f296 f1 f290 f291" data-node-id="86:2623" data-name="heart">
        <div className="f5 f297" data-node-id="86:2624" data-name="bookmark">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark} />
        </div>
      </div>
      <div className="f5 f298 f299 f300 f1 f301 f302 f303" data-node-id="86:2626" data-name="Поиск шаблона">
        <div className="f5 f304 f305 f306" data-node-id="86:2627" data-name="search">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgSearch} />
        </div>
        <p className="f52 f5 f165 f54 f307 f55 f269 f308 f309 f310" data-node-id="86:2629">
          Найти шаблон
        </p>
      </div>
      <div className="f5 f25 f311 f312" data-node-id="86:2630" data-name="filter">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgFilter} />
      </div>
      <div className="f5 f0 f176 f173 f1 f177 f145" data-node-id="86:2632" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f313 f82 f181" data-node-id="86:2633">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:2634" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:2635" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:2636" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:2637" data-name="Сотовая связь" />
        <div className="f5 f0 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:2638" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:2639" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:2640" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:2641" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <div className="f5 f28 f29 f314 f31 f315 f316" data-node-id="86:2645">
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2646" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f310 f323" data-node-id="86:2647">
            Тариф
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2648">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2649" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f328 f323" data-node-id="86:2650">
            Формат
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2651">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2652" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f329 f323" data-node-id="86:2653">
            Тема
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2654">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2655" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f330 f323" data-node-id="86:2656">
            Количество страниц
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2657">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2658" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f331 f323" data-node-id="86:2659">
            Цена
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2660">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
      </div>
      <div className="f5 f332 f29 f333 f334 f31 f335 f336 f337" data-node-id="86:2661">
        <a className="f6 f338 f339 f37 f7 f340 f1 f2 f341 f43 f342" data-node-id="86:2662" style={{ backgroundImage: "linear-gradient(90deg, rgba(233, 212, 243, 0.58) 0%, rgba(233, 212, 243, 0.58) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
          <div className="f5 f343 f344 f345 f346 f347" data-node-id="86:2663" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img} />
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f135 f350 f351" data-node-id="86:2664">
            Генерация альбома
          </p>
        </a>
        <a className="f34 f6 f36 f339 f37 f7 f340 f1 f2 f341 f43 f342" data-node-id="86:2665">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2666" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img1} />
            <div className="f5 f45 f352 f353 f1 f354 f355 f356" data-node-id="86:2667" data-name="Новинка">
              <p className="f52 f5 f165 f54 f357 f55 f56 f358 f135 f359 f294 f310" data-node-id="86:2668">
                Новинка
              </p>
            </div>
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2669" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2670" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f135 f350 f351" data-node-id="86:2672">
            Лето внутри
          </p>
        </a>
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2673">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2674" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img2} />
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2677" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2678" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2680">
            Про любовь
          </p>
        </div>
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2681">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2682" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img3} />
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2685" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2686" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2688">
            Лучшие моменты
          </p>
        </div>
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2689">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2690" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img4} />
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2693" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2694" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2696">
            Этот год
          </p>
        </div>
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2697">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2698" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img5} />
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2701" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2702" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2704">
            Тихие дни
          </p>
        </div>
      </div>
    </div>
  );
}
