import React from "react";
const assetPathPrefix = "/assets";
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgBack = `${assetPathPrefix}/9d936.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f217 f1 f2 f801 f4" data-node-id="86:3211" data-name="PicPac · Прототип / 4.2 · Пункты выдачи — карта · Бренд v2">
      <div className="f5 f196 f176 f173 f1 f177 f145" data-node-id="86:3212" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f454 f82 f713" data-node-id="86:3213">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:3214" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:3215" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:3216" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:3217" data-name="Сотовая связь" />
        <div className="f5 f196 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:3218" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:3219" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:3220" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:3221" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <a className="f5 f802 f6 f694 f803 f37 f7 f32 f1 f804 f805 f11" data-node-id="86:3224" data-name="Назад">
        <div className="f5 f806 f807 f808" data-node-id="86:3225" data-name="back">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
        </div>
      </a>
      <p className="f60 f52 f5 f53 f809 f178 f810 f55 f56 f811 f58 f623 f812" data-node-id="86:3228">
        Пункт выдачи
      </p>
      <div className="f5 f176 f32 f1 f814 f150" data-node-id="86:3229" data-name="Поиск">
        <div className="f5 f802 f176 f173 f396 f145 f150" data-node-id="86:3230" data-name="Поиск адреса" />
        <p className="f52 f5 f53 f453 f433 f55 f391 f454 f65 f855" data-node-id="86:3231">
          Минск, улица или адрес
        </p>
      </div>
      <div className="f5 f856 f32 f1 f857 f150" data-node-id="86:3232" data-name="Переключатель">
        <div className="f5 f394 f856 f173 f858 f145 f150" data-node-id="86:3233" data-name="Режим выбора" />
        <a className="f60 f52 f5 f6 f7 f53 f138 f862 f55 f56 f454 f58 f65 f863" data-node-id="86:3234">
          <p className="f453">Список</p>
        </a>
        <div className="f5 f93 f859 f878 f402 f860 f861" data-node-id="86:3235" data-name="Карта — выбрана" />
        <p className="f60 f52 f5 f53 f453 f864 f55 f454 f58 f103 f65 f865" data-node-id="86:3236">
          На карте
        </p>
      </div>
      <div className="f5 f879 f880 f32 f1 f858 f823 f150" data-node-id="86:3237" data-name="Карта">
        <div className="f5 f881 f882 f567 f396 f883 f884" data-node-id="86:3238" data-name="Сквер" />
        <div className="f5 f881 f273 f885 f858 f383 f23" data-node-id="86:3239" data-name="Зелёная зона" />
        <div className="f5 f802 f76 f173 f312 f150" data-node-id="86:3240" data-name="Улица" />
        <div className="f5 f802 f886 f173 f431 f150" data-node-id="86:3241" data-name="Улица" />
        <div className="f5 f802 f880 f887 f145 f888" data-node-id="86:3242" data-name="Улица" />
        <div className="f5 f802 f880 f889 f145 f214" data-node-id="86:3243" data-name="Улица" />
        <div className="f5 f890 f384 f8 f891 f892 f627" data-node-id="86:3244" data-name="Городской квартал" />
        <div className="f5 f890 f893 f894 f891 f192 f895" data-node-id="86:3245" data-name="Городской квартал" />
        <div className="f5 f890 f585 f834 f891 f719 f896" data-node-id="86:3246" data-name="Городской квартал" />
        <div className="f5 f890 f897 f704 f891 f898 f607" data-node-id="86:3247" data-name="Городской квартал" />
        <p className="f52 f5 f53 f613 f704 f55 f391 f899 f840 f738" data-node-id="86:3248">
          пр-т Независимости
        </p>
        <p className="f52 f5 f53 f613 f900 f55 f391 f899 f901 f861" data-node-id="86:3249">
          ул. Якуба Коласа
        </p>
        <p className="f52 f5 f53 f457 f230 f55 f902 f458 f11 f903" data-node-id="86:3250">
          Сквер
        </p>
        <div className="f5 f93 f139 f1 f402 f10 f904" data-node-id="86:3251" data-name="Пункт 1">
          <p className="f60 f52 f5 f53 f446 f567 f55 f447 f58 f103 f435 f905" data-node-id="86:3252">
            1
          </p>
        </div>
        <div className="f5 f837 f864 f1 f402 f10 f906" data-node-id="86:3253" data-name="Пункт 2">
          <p className="f60 f52 f5 f53 f446 f567 f55 f56 f447 f58 f435 f905" data-node-id="86:3254">
            2
          </p>
        </div>
        <div className="f5 f837 f907 f1 f402 f10 f908" data-node-id="86:3255" data-name="Пункт 3">
          <p className="f60 f52 f5 f53 f446 f567 f55 f56 f447 f58 f435 f905" data-node-id="86:3256">
            3
          </p>
        </div>
        <div className="f5 f802 f875 f909 f396 f82 f910" data-node-id="86:3257" data-name="Масштаб" />
        <p className="f60 f52 f5 f53 f412 f911 f55 f56 f413 f58 f192 f910" data-node-id="86:3258">
          +
        </p>
        <p className="f60 f52 f5 f53 f412 f911 f55 f56 f413 f58 f737 f910" data-node-id="86:3259">
          −
        </p>
        <div className="f5 f802 f912 f48 f42 f913 f476" data-node-id="86:3260" data-name="Подпись карты" />
        <p className="f52 f5 f53 f84 f613 f914 f391 f899 f915 f916" data-node-id="86:3261" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Схема расположения · Минск
        </p>
      </div>
      <div className="f5 f868 f32 f1 f917 f150" data-node-id="86:3262" data-name="Выбранный пункт">
        <div className="f5 f802 f868 f173 f396 f145 f150" data-node-id="86:3263" data-name="Выбранный пункт 1" />
        <p className="f52 f5 f53 f84 f446 f433 f56 f447 f82 f448 f843" data-node-id="86:3264" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{`●  пр-т Независимости, 58`}</p>
        <p className="f52 f5 f53 f84 f449 f433 f391 f455 f870 f448" data-node-id="86:3265" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Ежедневно 09:00–21:00 · 0,6 км от вас
        </p>
        <p className="f52 f5 f53 f453 f433 f55 f56 f454 f827 f448" data-node-id="86:3266">
          Получение через 5–8 рабочих дней
        </p>
        <p className="f52 f5 f53 f449 f433 f55 f56 f455 f904 f448" data-node-id="86:3267">
          Доставка 5,00 BYN
        </p>
      </div>
      <div className="f5 f875 f32 f1 f876 f150" data-node-id="86:3268" data-name="Действие">
        <a className="f5 f93 f6 f7 f460 f173 f341 f145 f150" data-node-id="86:3269" data-name="Выбрать пункт" />
        <p className="f60 f52 f5 f53 f824 f462 f55 f180 f58 f103 f82 f463" data-node-id="86:3270">
          Выбрать этот пункт
        </p>
        <p className="f60 f52 f5 f53 f449 f462 f55 f391 f455 f58 f877 f150" data-node-id="86:3271">
          Адрес можно изменить до оплаты
        </p>
      </div>
    </div>
  );
}
