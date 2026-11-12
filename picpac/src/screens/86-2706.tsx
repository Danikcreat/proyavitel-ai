import React from "react";
const assetPathPrefix = "/assets";
const img = `${assetPathPrefix}/689cc.png`;
const img1 = `${assetPathPrefix}/3f78b.png`;
const img2 = `${assetPathPrefix}/fd8ef.png`;
const img3 = `${assetPathPrefix}/7fb69.png`;
const img4 = `${assetPathPrefix}/bd681.png`;
const img5 = `${assetPathPrefix}/83f0b.png`;
const imgBack = `${assetPathPrefix}/99cb8.svg`;
const imgBookmark = `${assetPathPrefix}/9b7c2.svg`;
const imgSearch = `${assetPathPrefix}/a1aec.svg`;
const imgFilter = `${assetPathPrefix}/8f450.svg`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgVector5 = `${assetPathPrefix}/a39a7.svg`;
const imgBookmark1 = `${assetPathPrefix}/43900.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f0 f1 f2 f3 f4" data-node-id="86:2706" data-name="PicPac · Прототип / 2.1.2 · Карточка шаблона · Бренд v2">
      <div className="f5 f289 f290 f291" data-node-id="86:2707" data-name="back">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
      </div>
      <p className="f60 f52 f5 f53 f54 f292 f55 f56 f293 f58 f291 f294 f295" data-node-id="86:2709">
        Фотокниги
      </p>
      <div className="f5 f296 f1 f290 f291" data-node-id="86:2710" data-name="heart">
        <div className="f5 f297" data-node-id="86:2711" data-name="bookmark">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark} />
        </div>
      </div>
      <div className="f5 f298 f299 f300 f1 f301 f302 f303" data-node-id="86:2713" data-name="Поиск шаблона">
        <div className="f5 f304 f305 f306" data-node-id="86:2714" data-name="search">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgSearch} />
        </div>
        <p className="f52 f5 f165 f54 f307 f55 f269 f308 f309 f310" data-node-id="86:2716">
          Найти шаблон
        </p>
      </div>
      <div className="f5 f25 f311 f312" data-node-id="86:2717" data-name="filter">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgFilter} />
      </div>
      <p className="f52 f5 f53 f54 f368 f55 f56 f369 f370 f371" data-node-id="86:2719">
        Наши истории
      </p>
      <p className="f52 f5 f53 f54 f372 f55 f56 f369 f373 f371" data-node-id="86:2720">
        Про любовь
      </p>
      <p className="f52 f5 f53 f54 f368 f55 f56 f369 f373 f371" data-node-id="86:2721">
        Лучшие моменты
      </p>
      <p className="f52 f5 f53 f54 f372 f55 f56 f369 f374 f371" data-node-id="86:2722">
        Этот год
      </p>
      <p className="f52 f5 f53 f54 f368 f55 f56 f369 f374 f371" data-node-id="86:2723">
        Тихие дни
      </p>
      <div className="f5 f0 f176 f173 f1 f177 f145" data-node-id="86:2724" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f313 f82 f181" data-node-id="86:2725">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:2726" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:2727" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:2728" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:2729" data-name="Сотовая связь" />
        <div className="f5 f0 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:2730" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:2731" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:2732" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:2733" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <div className="f60 f5 f93 f215 f208 f61 f201 f216" data-node-id="86:2736" data-name="iOS · Индикатор домой" />
      <div className="f5 f28 f29 f314 f31 f315 f316" data-node-id="86:2737">
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2738" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f310 f323" data-node-id="86:2739">
            Тариф
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2740">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2741" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f328 f323" data-node-id="86:2742">
            Формат
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2743">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2744" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f329 f323" data-node-id="86:2745">
            Тема
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2746">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2747" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f330 f323" data-node-id="86:2748">
            Количество страниц
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2749">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
        <div className="f298 f28 f29 f317 f318 f31 f40 f1 f319 f320 f2 f321 f43" data-node-id="86:2750" data-name="Все">
          <p className="f52 f165 f54 f55 f2 f43 f56 f322 f58 f331 f323" data-node-id="86:2751">
            Цена
          </p>
          <div className="f324 f2 f43 f325 f326" data-node-id="86:2752">
            <div className="f5 f327">
              <img alt="" className="f6 f17 f4" src={imgVector5} />
            </div>
          </div>
        </div>
      </div>
      <div className="f5 f332 f29 f333 f334 f31 f335 f336 f337" data-node-id="86:2753">
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2754">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2755" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img} />
            <div className="f5 f45 f352 f353 f1 f354 f355 f356" data-node-id="86:2756" data-name="Новинка">
              <p className="f52 f5 f165 f54 f357 f55 f56 f358 f359 f294 f310" data-node-id="86:2757">
                Новинка
              </p>
            </div>
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2758" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2759" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2761">
            Лето внутри
          </p>
        </div>
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2762">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2763" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img1} />
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2766" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2767" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2769">
            Наша история
          </p>
        </div>
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2770">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2771" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img2} />
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2774" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2775" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2777">
            Про любовь
          </p>
        </div>
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2778">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2779" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img3} />
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2782" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2783" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2785">
            Лучшие моменты
          </p>
        </div>
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2786">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2787" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img4} />
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2790" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2791" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2793">
            Этот год
          </p>
        </div>
        <div className="f34 f36 f339 f37 f340 f1 f2 f341 f43 f342" data-node-id="86:2794">
          <div className="f5 f343 f344 f1 f345 f346 f347" data-node-id="86:2795" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f345 f4" src={img5} />
            <div className="f5 f34 f360 f361 f1 f362 f363 f364" data-node-id="86:2798" data-name="bookmark">
              <div className="f5 f365 f366 f367" data-node-id="86:2799" data-name="bookmark">
                <img alt="" className="f5 f6 f12 f17 f4" src={imgBookmark1} />
              </div>
            </div>
          </div>
          <p className="f52 f5 f53 f54 f348 f55 f56 f349 f350 f351" data-node-id="86:2801">
            Тихие дни
          </p>
        </div>
      </div>
      <div className="f5 f217 f218 f375 f219 f376 f377" data-node-id="86:2802" />
      <a className="f5 f241 f6 f7 f378 f173 f243 f379 f221" data-node-id="86:2803" data-name="Затемнение каталога · закрыть окно" />
      <div className="f5 f0 f380 f173 f1 f381 f382 f383 f221" data-node-id="86:2804" data-name="Окно выбранного шаблона">
        <div className="f5 f247 f248 f249 f250 f251 f252" data-node-id="86:2805" data-name="Индикатор панели" />
        <div className="f5 f384 f32 f1 f385 f150" data-node-id="86:2806" data-name="Заголовок шаблона">
          <p className="f52 f5 f53 f386 f387 f55 f56 f388 f145 f389" data-node-id="86:2807">
            Лето внутри
          </p>
          <p className="f52 f5 f165 f100 f390 f387 f391 f392 f393 f310" data-node-id="86:2808" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Шаблон фотокниги · Classic
          </p>
          <a className="f5 f394 f6 f7 f395 f1 f396 f397 f145" data-node-id="86:2809" data-name="Закрыть окно шаблона">
            <p className="f60 f52 f5 f53 f84 f398 f32 f56 f399 f58 f145 f400" data-node-id="86:2810" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
              ×
            </p>
          </a>
        </div>
        <div className="f5 f59 f401 f32 f1 f402 f403 f150" data-node-id="86:2811" data-name="Превью и цена">
          <p className="f52 f5 f53 f84 f404 f405 f56 f406 f407 f310" data-node-id="86:2812" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Classic · 20 × 20 см
          </p>
          <p className="f52 f5 f165 f100 f408 f405 f391 f409 f410 f411" data-node-id="86:2813" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            20 страниц · 10 разворотов
          </p>
          <p className="f52 f5 f53 f412 f405 f55 f56 f413 f414 f415" data-node-id="86:2814">
            72,90 BYN
          </p>
          <p className="f52 f5 f165 f100 f416 f405 f391 f417 f418 f310" data-node-id="86:2815" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            За фотокнигу · без доставки
          </p>
          <div className="f5 f419 f108 f1 f420 f421 f422" data-node-id="86:2816" data-name="Лето внутри — обложка">
            <img alt="" className="f5 f12 f17 f112 f14 f420 f4" src={img} />
            <div className="f5 f45 f423 f424 f1 f425 f426 f427" data-node-id="86:2817" data-name="Новинка">
              <p className="f52 f5 f165 f54 f428 f55 f56 f429 f430 f294 f310" data-node-id="86:2818">
                Новинка
              </p>
            </div>
          </div>
        </div>
        <div className="f52 f5 f147 f401 f32 f1 f402 f431 f150" data-node-id="86:2822" data-name="Характеристики">
          <p className="f5 f53 f432 f433 f55 f56 f434 f435 f310" data-node-id="86:2823">
            Краткие характеристики
          </p>
          <p className="f5 f53 f436 f433 f55 f391 f437 f438 f439" data-node-id="86:2824">
            Обложка
          </p>
          <p className="f5 f165 f436 f440 f55 f56 f437 f438 f441" data-node-id="86:2825">
            Твёрдая
          </p>
          <p className="f5 f53 f436 f433 f55 f391 f437 f442 f439" data-node-id="86:2826">
            Бумага
          </p>
          <p className="f5 f165 f100 f436 f440 f56 f437 f442 f441" data-node-id="86:2827" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Мелованная · 0,28 мм
          </p>
          <p className="f5 f53 f436 f433 f55 f391 f437 f443 f439" data-node-id="86:2828">
            Ламинация
          </p>
          <p className="f5 f165 f436 f440 f55 f56 f437 f443 f441" data-node-id="86:2829">
            Глянцевая / зернистая
          </p>
        </div>
        <div className="f52 f5 f147 f53 f444 f32 f1 f396 f445 f150" data-node-id="86:2830" data-name="Количество страниц">
          <p className="f5 f446 f433 f55 f56 f447 f78 f448" data-node-id="86:2831">
            20 страниц в этом шаблоне
          </p>
          <p className="f5 f84 f449 f433 f391 f450 f385 f448" data-node-id="86:2832" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            10 разворотов · можно расширить до 60 страниц
          </p>
        </div>
        <div className="f52 f5 f64 f53 f451 f32 f1 f396 f452 f150" data-node-id="86:2833" data-name="Срок доставки">
          <p className="f5 f453 f433 f55 f56 f454 f78 f448" data-node-id="86:2834">
            Получение через 5–8 рабочих дней
          </p>
          <p className="f5 f449 f433 f55 f56 f455 f456 f448" data-node-id="86:2835">
            Печать 3–5 дн. + доставка 2–3 дн.
          </p>
          <p className="f5 f84 f457 f433 f391 f458 f459 f448" data-node-id="86:2836" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Ориентировочно · уточним при оформлении
          </p>
        </div>
        <a className="f5 f93 f6 f7 f460 f32 f1 f341 f461 f150" data-node-id="86:2837" data-name="Выбор шаблона">
          <p className="f60 f52 f5 f53 f84 f446 f462 f447 f58 f103 f82 f463" data-node-id="86:2838" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Выбрать шаблон · 72,90 BYN
          </p>
        </a>
      </div>
    </div>
  );
}
