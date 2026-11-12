import React from "react";
const assetPathPrefix = "/assets";
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgBack = `${assetPathPrefix}/9d936.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f217 f1 f2 f801 f4" data-node-id="86:3108" data-name="PicPac · Прототип / 4 · Оформление заказа · Бренд v2">
      <div className="f5 f196 f176 f173 f1 f177 f145" data-node-id="86:3109" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f454 f82 f713" data-node-id="86:3110">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:3111" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:3112" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:3113" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:3114" data-name="Сотовая связь" />
        <div className="f5 f196 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:3115" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:3116" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:3117" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:3118" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <a className="f5 f802 f6 f694 f803 f37 f7 f32 f1 f804 f805 f11" data-node-id="86:3121" data-name="Назад">
        <div className="f5 f806 f807 f808" data-node-id="86:3122" data-name="back">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
        </div>
      </a>
      <p className="f60 f52 f5 f53 f809 f178 f810 f55 f56 f811 f58 f623 f812" data-node-id="86:3125">
        Оформление заказа
      </p>
      <div className="f5 f813 f32 f1 f814 f150" data-node-id="86:3126" data-name="Заказ">
        <div className="f5 f802 f813 f173 f396 f145 f150" data-node-id="86:3127" data-name="Карточка заказа" />
        <p className="f52 f5 f53 f449 f433 f55 f56 f455 f78 f815" data-node-id="86:3128">
          Название заказа
        </p>
        <div className="f5 f816 f817 f48 f818 f819 f463" data-node-id="86:3129" data-name="Редактировать личное название" />
        <p className="f52 f5 f53 f446 f477 f55 f56 f447 f820 f738" data-node-id="86:3130">
          Моё лето
        </p>
        <p className="f52 f5 f53 f457 f821 f55 f56 f458 f231 f822" data-node-id="86:3131">
          Изменить
        </p>
        <p className="f52 f5 f53 f84 f457 f433 f391 f458 f475 f715" data-node-id="86:3132" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Видно только вам · не печатается на изделиях
        </p>
      </div>
      <div className="f5 f813 f32 f1 f823 f150" data-node-id="86:3133" data-name="Получатель">
        <div className="f5 f802 f813 f173 f396 f145 f150" data-node-id="86:3134" data-name="Данные получателя" />
        <p className="f52 f5 f53 f824 f433 f55 f56 f180 f49 f825" data-node-id="86:3135">
          Получатель
        </p>
        <p className="f52 f5 f53 f446 f433 f55 f56 f447 f820 f826" data-node-id="86:3136">
          Анна
        </p>
        <p className="f52 f5 f53 f453 f433 f55 f391 f454 f827 f828" data-node-id="86:3137">
          +375 29 000-00-00
        </p>
        <p className="f52 f5 f53 f457 f829 f55 f56 f458 f830 f831" data-node-id="86:3138">
          Изменить
        </p>
      </div>
      <div className="f5 f832 f32 f1 f833 f150" data-node-id="86:3139" data-name="Доставка">
        <a className="f5 f802 f6 f7 f832 f173 f396 f145 f150" data-node-id="86:3140" data-name="Выбранный пункт выдачи" />
        <p className="f52 f5 f53 f824 f433 f55 f56 f180 f49 f825" data-node-id="86:3141">
          Пункт выдачи
        </p>
        <p className="f52 f5 f53 f84 f457 f834 f56 f458 f835 f411" data-node-id="86:3142" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Выбрать / изменить →
        </p>
        <p className="f52 f5 f53 f84 f446 f433 f56 f447 f110 f448" data-node-id="86:3143" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Минск · пр-т Независимости, 58
        </p>
        <p className="f52 f5 f53 f84 f449 f433 f391 f455 f836 f715" data-node-id="86:3144" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Ежедневно 09:00–21:00 · доставка 5,00 BYN
        </p>
        <div className="f5 f837 f176 f48 f42 f403 f463" data-node-id="86:3145" data-name="Ожидаемый срок доставки" />
        <p className="f52 f5 f53 f453 f8 f55 f56 f454 f838 f839" data-node-id="86:3146">
          Получение через 5–8 рабочих дней
        </p>
        <p className="f52 f5 f53 f84 f457 f8 f391 f458 f840 f839" data-node-id="86:3147" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          С учётом печати · ориентировочно
        </p>
      </div>
      <div className="f5 f841 f32 f1 f561 f150" data-node-id="86:3148" data-name="Способ оплаты">
        <div className="f5 f802 f841 f173 f396 f145 f150" data-node-id="86:3149" data-name="Банковская карта" />
        <p className="f52 f5 f53 f824 f433 f55 f56 f180 f49 f842" data-node-id="86:3150">
          Способ оплаты
        </p>
        <p className="f52 f5 f53 f84 f446 f433 f56 f447 f110 f842 f843" data-node-id="86:3151" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>{`●  Банковской картой онлайн`}</p>
      </div>
      <div className="f52 f5 f53 f844 f32 f1 f56 f602 f150" data-node-id="86:3152" data-name="Сумма">
        <p className="f5 f84 f453 f845 f454 f145 f776" data-node-id="86:3153" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Товары · 2 позиции
        </p>
        <p className="f5 f453 f846 f55 f454 f145 f847" data-node-id="86:3154">
          74,55 BYN
        </p>
        <p className="f5 f453 f845 f55 f454 f189 f295" data-node-id="86:3155">
          Доставка
        </p>
        <p className="f5 f453 f846 f55 f454 f189 f847" data-node-id="86:3156">
          5,00 BYN
        </p>
        <p className="f5 f848 f845 f55 f849 f850 f295" data-node-id="86:3157">
          Итого
        </p>
        <p className="f5 f848 f851 f55 f849 f850 f852" data-node-id="86:3158">
          79,55 BYN
        </p>
      </div>
      <div className="f5 f853 f32 f1 f854 f150" data-node-id="86:3159" data-name="Действие">
        <div className="f5 f93 f460 f173 f341 f145 f150" data-node-id="86:3160" data-name="Перейти к оплате" />
        <p className="f60 f52 f5 f53 f84 f824 f462 f180 f58 f103 f82 f463" data-node-id="86:3161" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          Перейти к оплате · 79,55 BYN
        </p>
        <div className="f60 f52 f5 f53 f138 f462 f55 f391 f458 f58 f27 f337" data-node-id="86:3162">
          <p className="f457 f142">Нажимая кнопку, вы соглашаетесь</p>
          <p className="f457">с условиями заказа и обработки данных</p>
        </div>
      </div>
    </div>
  );
}
