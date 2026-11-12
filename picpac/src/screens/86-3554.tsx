import React from "react";
const assetPathPrefix = "/assets";
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgBack = `${assetPathPrefix}/9d936.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f217 f1 f2 f801 f4" data-node-id="86:3554" data-name="PicPac · Прототип / 1.1.3 · Связаться с нами · Бренд v2">
      <div className="f5 f196 f176 f173 f1 f177 f145" data-node-id="86:3555" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f454 f82 f713" data-node-id="86:3556">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:3557" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:3558" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:3559" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:3560" data-name="Сотовая связь" />
        <div className="f5 f196 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:3561" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:3562" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:3563" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:3564" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <a className="f5 f802 f6 f694 f803 f37 f7 f32 f1 f804 f805 f11" data-node-id="86:3567" data-name="Назад">
        <div className="f5 f806 f807 f808" data-node-id="86:3568" data-name="back">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
        </div>
      </a>
      <p className="f60 f52 f5 f53 f809 f178 f810 f55 f56 f811 f58 f623 f812" data-node-id="86:3571">
        Связаться с нами
      </p>
      <div className="f5 f813 f32 f1 f814 f150" data-node-id="86:3572" data-name="Поддержка">
        <div className="f5 f837 f813 f173 f396 f145 f150" data-node-id="86:3573" data-name="Помощь PicPac" />
        <p className="f52 f5 f53 f1209 f433 f55 f56 f610 f82 f448" data-node-id="86:3574">
          Я рядом, если нужна помощь
        </p>
        <div className="f52 f5 f53 f138 f433 f55 f56 f454 f1206 f448" data-node-id="86:3575">
          <p className="f453 f142">По заказу, печати или работе приложения.</p>
          <p className="f453">Напишите нам — разберёмся вместе.</p>
        </div>
      </div>
      <div className="f5 f1210 f32 f1 f908 f150" data-node-id="86:3576" data-name="Каналы связи">
        <div className="f5 f802 f1210 f173 f396 f145 f150" data-node-id="86:3577" data-name="Способы связи" />
        <p className="f52 f5 f53 f453 f433 f55 f56 f454 f830 f796" data-node-id="86:3578">
          Написать в поддержку
        </p>
        <p className="f52 f5 f53 f84 f824 f650 f56 f180 f830 f1211" data-node-id="86:3579" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          →
        </p>
        <p className="f52 f5 f53 f449 f433 f55 f391 f450 f731 f1212" data-node-id="86:3580">
          Ответим в приложении
        </p>
        <p className="f52 f5 f53 f453 f433 f55 f56 f454 f827 f796" data-node-id="86:3581">
          Сообщить о проблеме с заказом
        </p>
        <p className="f52 f5 f53 f84 f824 f650 f56 f180 f827 f1211" data-node-id="86:3582" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          →
        </p>
        <p className="f52 f5 f53 f449 f433 f55 f391 f450 f872 f1212" data-node-id="86:3583">
          Выберите заказ и опишите ситуацию
        </p>
        <p className="f52 f5 f53 f453 f433 f55 f56 f454 f466 f796" data-node-id="86:3584">
          Вопрос о печати и доставке
        </p>
        <p className="f52 f5 f53 f84 f824 f650 f56 f180 f466 f1211" data-node-id="86:3585" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          →
        </p>
        <p className="f52 f5 f53 f449 f433 f55 f391 f450 f1213 f1212" data-node-id="86:3586">
          Поможем с выбором и сроками
        </p>
      </div>
      <div className="f5 f1214 f32 f1 f1215 f150" data-node-id="86:3587" data-name="Сообщение">
        <p className="f52 f5 f53 f824 f173 f55 f56 f180 f145 f150" data-node-id="86:3588">
          Новое обращение
        </p>
        <div className="f5 f802 f856 f173 f396 f1205 f150" data-node-id="86:3589" data-name="Тема обращения" />
        <p className="f52 f5 f53 f453 f433 f55 f56 f454 f870 f448" data-node-id="86:3590">
          Вопрос по заказу №6403839
        </p>
        <div className="f5 f802 f1216 f173 f396 f1217 f150" data-node-id="86:3591" data-name="Сообщение — поле ввода" />
        <p className="f52 f5 f53 f453 f433 f55 f391 f454 f403 f448" data-node-id="86:3592">
          Опишите, чем мы можем помочь…
        </p>
      </div>
      <div className="f5 f853 f32 f1 f854 f150" data-node-id="86:3593" data-name="Действие">
        <div className="f5 f93 f460 f173 f341 f145 f150" data-node-id="86:3594" data-name="Отправить сообщение в поддержку" />
        <p className="f60 f52 f5 f53 f824 f462 f55 f180 f58 f103 f82 f463" data-node-id="86:3595">
          Отправить сообщение
        </p>
        <div className="f60 f52 f5 f53 f138 f462 f55 f391 f450 f58 f877 f150" data-node-id="86:3596">
          <p className="f449 f142">Ответ появится в уведомлениях.</p>
          <p className="f449">История обращения сохранится в профиле.</p>
        </div>
      </div>
    </div>
  );
}
