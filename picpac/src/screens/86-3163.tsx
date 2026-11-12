import React from "react";
const assetPathPrefix = "/assets";
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgBack = `${assetPathPrefix}/9d936.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f217 f1 f2 f801 f4" data-node-id="86:3163" data-name="PicPac · Прототип / 4.1 · Пункты выдачи — список · Бренд v2">
      <div className="f5 f196 f176 f173 f1 f177 f145" data-node-id="86:3164" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f454 f82 f713" data-node-id="86:3165">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:3166" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:3167" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:3168" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:3169" data-name="Сотовая связь" />
        <div className="f5 f196 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:3170" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:3171" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:3172" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:3173" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <a className="f5 f802 f6 f694 f803 f37 f7 f32 f1 f804 f805 f11" data-node-id="86:3176" data-name="Назад">
        <div className="f5 f806 f807 f808" data-node-id="86:3177" data-name="back">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
        </div>
      </a>
      <p className="f60 f52 f5 f53 f809 f178 f810 f55 f56 f811 f58 f623 f812" data-node-id="86:3180">
        Пункт выдачи
      </p>
      <div className="f5 f176 f32 f1 f814 f150" data-node-id="86:3181" data-name="Поиск">
        <div className="f5 f802 f176 f173 f396 f145 f150" data-node-id="86:3182" data-name="Поиск адреса" />
        <p className="f52 f5 f53 f453 f433 f55 f391 f454 f65 f855" data-node-id="86:3183">
          Минск, улица или адрес
        </p>
      </div>
      <div className="f5 f856 f32 f1 f857 f150" data-node-id="86:3184" data-name="Переключатель">
        <div className="f5 f394 f856 f173 f858 f145 f150" data-node-id="86:3185" data-name="Режим выбора" />
        <div className="f5 f93 f859 f845 f402 f860 f861" data-node-id="86:3186" data-name="Список — выбран" />
        <p className="f60 f52 f5 f53 f453 f862 f55 f454 f58 f103 f65 f863" data-node-id="86:3187">
          Список
        </p>
        <a className="f60 f52 f5 f6 f7 f53 f138 f864 f55 f56 f454 f58 f65 f865" data-node-id="86:3188">
          <p className="f453">На карте</p>
        </a>
      </div>
      <div className="f5 f76 f32 f1 f866 f150" data-node-id="86:3189" data-name="Подсказка">
        <p className="f52 f5 f53 f84 f453 f173 f391 f454 f145 f150" data-node-id="86:3190" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          3 пункта · выберите удобный адрес
        </p>
      </div>
      <div className="f52 f5 f53 f867 f32 f1 f630 f150" data-node-id="86:3191" data-name="Пункты выдачи">
        <div className="f5 f837 f868 f173 f1 f396 f145 f150" data-node-id="86:3192" data-name="Пункт выдачи 1">
          <p className="f5 f84 f446 f433 f56 f447 f82 f448 f843" data-node-id="86:3193" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{`●  пр-т Независимости, 58`}</p>
          <p className="f5 f453 f869 f55 f391 f454 f870 f842" data-node-id="86:3194">
            Ежедневно 09:00–21:00
          </p>
          <p className="f5 f84 f449 f869 f391 f455 f626 f871" data-node-id="86:3195" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            0,6 км от вас · доставка 5,00 BYN
          </p>
          <p className="f5 f449 f869 f55 f56 f450 f872 f842" data-node-id="86:3196">
            Получение через 5–8 рабочих дней
          </p>
        </div>
        <div className="f5 f802 f868 f173 f1 f396 f873 f150" data-node-id="86:3197" data-name="Пункт выдачи 2">
          <p className="f5 f84 f446 f433 f56 f447 f82 f448 f843" data-node-id="86:3198" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{`○  ул. Якуба Коласа, 15`}</p>
          <p className="f5 f453 f869 f55 f391 f454 f870 f842" data-node-id="86:3199">
            Пн–сб 10:00–20:00
          </p>
          <p className="f5 f84 f449 f869 f391 f455 f626 f871" data-node-id="86:3200" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            1,2 км от вас · доставка 5,00 BYN
          </p>
          <p className="f5 f449 f869 f55 f56 f450 f872 f842" data-node-id="86:3201">
            Получение через 5–8 рабочих дней
          </p>
        </div>
        <div className="f5 f802 f868 f173 f1 f396 f874 f150" data-node-id="86:3202" data-name="Пункт выдачи 3">
          <p className="f5 f84 f446 f433 f56 f447 f82 f448 f843" data-node-id="86:3203" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{`○  ул. Сурганова, 40`}</p>
          <p className="f5 f453 f869 f55 f391 f454 f870 f842" data-node-id="86:3204">
            Ежедневно 10:00–21:00
          </p>
          <p className="f5 f84 f449 f869 f391 f455 f626 f871" data-node-id="86:3205" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            1,8 км от вас · доставка 5,00 BYN
          </p>
          <p className="f5 f449 f869 f55 f56 f450 f872 f842" data-node-id="86:3206">
            Получение через 5–8 рабочих дней
          </p>
        </div>
      </div>
      <div className="f5 f875 f32 f1 f876 f150" data-node-id="86:3207" data-name="Действие">
        <a className="f5 f93 f6 f7 f460 f173 f341 f145 f150" data-node-id="86:3208" data-name="Выбрать пункт" />
        <p className="f60 f52 f5 f53 f824 f462 f55 f180 f58 f103 f82 f463" data-node-id="86:3209">
          Выбрать этот пункт
        </p>
        <p className="f60 f52 f5 f53 f84 f449 f462 f391 f455 f58 f877 f150" data-node-id="86:3210" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Минск · пр-т Независимости, 58
        </p>
      </div>
    </div>
  );
}
