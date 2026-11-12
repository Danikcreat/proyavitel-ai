import React from "react";
const assetPathPrefix = "/assets";
const img = `${assetPathPrefix}/2e7db.png`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgBack = `${assetPathPrefix}/9d936.svg`;
const imgNext = `${assetPathPrefix}/1dd1f.svg`;
const imgCheck = `${assetPathPrefix}/ef26e.svg`;
const imgSearch = `${assetPathPrefix}/a1aec.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f217 f1 f2 f3 f4" data-node-id="86:3358" data-name="PicPac · Прототип / 1.1.1 · История заказов · Бренд v2">
      <div className="f5 f196 f176 f173 f1 f177 f145" data-node-id="86:3359" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f180 f82 f310" data-node-id="86:3360">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:3361" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:3362" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:3363" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:3364" data-name="Сотовая связь" />
        <div className="f5 f196 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:3365" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:3366" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:3367" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:3368" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <div className="f60 f5 f93 f215 f208 f61 f201 f216" data-node-id="86:3371" data-name="iOS · Индикатор домой" />
      <a className="f5 f802 f6 f694 f803 f37 f7 f32 f1 f804 f805 f11" data-node-id="86:3372" data-name="Назад">
        <div className="f5 f806 f807 f808" data-node-id="86:3373" data-name="back">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgBack} />
        </div>
      </a>
      <p className="f60 f52 f5 f53 f480 f292 f55 f56 f811 f58 f1040 f294 f1041" data-node-id="86:3375">
        История заказов
      </p>
      <div className="f5 f62 f315 f719" data-node-id="86:3376">
        <div className="f5 f93 f1042 f315 f1 f1016 f719 f895" data-node-id="86:3377" data-name="Все">
          <p className="f60 f52 f5 f165 f480 f1043 f55 f279 f58 f103 f559 f895" data-node-id="86:3378">
            Все
          </p>
        </div>
        <div className="f5 f1044 f1042 f1045 f1 f1016 f719 f1046" data-node-id="86:3379" data-name="В работе">
          <p className="f60 f52 f5 f165 f480 f1047 f55 f56 f279 f58 f559 f1046" data-node-id="86:3380">
            В работе
          </p>
        </div>
        <div className="f5 f1044 f1042 f1048 f1 f1016 f719 f277" data-node-id="86:3381" data-name="Завершённые">
          <p className="f60 f52 f5 f165 f480 f1049 f55 f56 f279 f58 f559 f277" data-node-id="86:3382">
            Завершённые
          </p>
        </div>
      </div>
      <div className="f5 f1050 f48 f1 f1051 f930" data-node-id="86:3383" data-name="Список заказов">
        <p className="f52 f5 f53 f480 f845 f55 f56 f1052 f145 f295" data-node-id="86:3384">
          В работе
        </p>
        <p className="f496 f52 f5 f165 f480 f497 f55 f968 f180 f498 f860 f1053" data-node-id="86:3385">
          3 заказа
        </p>
        <div className="f5 f147 f197 f694 f37 f1054 f173 f1 f858 f456 f930" data-node-id="86:3386" data-name="Заказ №6403839 · Моё лето">
          <div className="f5 f781 f782 f1055 f1056 f871" data-node-id="86:3387" data-name="Линия этапов" />
          <div className="f5 f45 f182 f1055 f1056 f1057" data-node-id="86:3388" data-name="Пройденные этапы" />
          <div className="f5 f1058 f108 f933 f65 f1053" data-node-id="86:3389" data-name="Фотокнига «Лето внутри»">
            <div className="f5 f12 f13 f14 f933">
              <img alt="" className="f5 f936 f937 f17 f938 f939" src={img} />
            </div>
          </div>
          <p className="f52 f5 f53 f480 f1034 f55 f56 f1059 f65 f776" data-node-id="86:3390">
            Моё лето
          </p>
          <p className="f52 f5 f165 f100 f480 f1034 f968 f447 f1060 f776" data-node-id="86:3391" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            №6403839 · Classic
          </p>
          <div className="f5 f64 f809 f1034 f1 f1061 f877 f1062" data-node-id="86:3392" data-name="Статус · В печати">
            <p className="f60 f52 f5 f949 f480 f230 f55 f56 f180 f58 f1063 f1062" data-node-id="86:3393">
              В печати
            </p>
          </div>
          <div className="f5 f1064 f991 f202" data-node-id="86:3394" data-name="next">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgNext} />
          </div>
          <p className="f52 f5 f165 f100 f480 f1034 f968 f447 f1065 f1066" data-node-id="86:3396" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Фотокнига · 24 страницы
          </p>
          <div className="f5 f45 f914 f1 f1067 f1068 f1069" data-node-id="86:3397" data-name="Этап 1 · Подан">
            <div className="f5 f1070 f1071 f1072" data-node-id="86:3398" data-name="check">
              <img alt="" className="f5 f6 f12 f17 f4" src={imgCheck} />
            </div>
          </div>
          <p className="f60 f52 f5 f165 f457 f1055 f55 f391 f454 f58 f1073 f1074" data-node-id="86:3400">
            Подан
          </p>
          <div className="f5 f45 f528 f1 f1067 f1068 f1069" data-node-id="86:3401" data-name="Этап 2 · Подтверждён">
            <div className="f5 f1070 f1071 f1072" data-node-id="86:3402" data-name="check">
              <img alt="" className="f5 f6 f12 f17 f4" src={imgCheck} />
            </div>
          </div>
          <p className="f60 f52 f5 f165 f1075 f457 f1076 f55 f391 f454 f58 f732 f1062" data-node-id="86:3404">
            Подтверждён
          </p>
          <div className="f5 f64 f1077 f1 f1067 f1068 f1069" data-node-id="86:3405" data-name="Этап 3 · В печати">
            <div className="f5 f93 f376 f201 f1078 f1063" data-node-id="86:3406" data-name="Текущий этап" />
          </div>
          <p className="f60 f52 f5 f949 f457 f1079 f55 f56 f454 f58 f1073 f1062" data-node-id="86:3407">
            В печати
          </p>
          <div className="f5 f147 f197 f694 f37 f1080 f1067 f1068 f1069" data-node-id="86:3408" data-name="Этап 4 · Готов" />
          <p className="f60 f52 f5 f165 f457 f900 f55 f391 f454 f58 f732 f1062" data-node-id="86:3409">
            Готов
          </p>
          <div className="f5 f147 f197 f694 f37 f1081 f1067 f1068 f1069" data-node-id="86:3410" data-name="Этап 5 · В доставке" />
          <p className="f60 f52 f5 f165 f457 f1082 f55 f391 f454 f58 f1073 f1062" data-node-id="86:3411">
            В доставке
          </p>
          <div className="f5 f147 f197 f694 f37 f779 f1067 f1068 f1069" data-node-id="86:3412" data-name="Этап 6 · Доставлен" />
          <p className="f60 f52 f5 f165 f457 f565 f55 f391 f454 f58 f732 f1062" data-node-id="86:3413">
            Доставлен
          </p>
          <div className="f5 f147 f197 f694 f37 f1083 f1067 f1068 f1069" data-node-id="86:3414" data-name="Этап 7 · Получен" />
          <p className="f60 f52 f5 f165 f457 f1084 f55 f391 f454 f58 f1073 f1074" data-node-id="86:3415">
            Получен
          </p>
        </div>
        <div className="f5 f147 f197 f694 f37 f1085 f173 f1 f858 f1086 f930" data-node-id="86:3416" data-name="Заказ №6403805 · Тёплые моменты">
          <div className="f5 f108 f1087 f1020 f65" data-node-id="86:3417" data-name="Превью заказа">
            <div className="f5 f12 f13 f14 f1087">
              <img alt="" className="f5 f1088 f1089 f17 f1090 f1091" src={img} />
            </div>
          </div>
          <p className="f52 f5 f53 f480 f474 f55 f56 f1059 f65 f1092" data-node-id="86:3418">
            Тёплые моменты
          </p>
          <p className="f52 f5 f165 f100 f480 f474 f968 f447 f1060 f1066" data-node-id="86:3419" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            №6403805 · Фото 10 × 15
          </p>
          <div className="f5 f1093 f1094 f474 f1 f1061 f27 f1053" data-node-id="86:3420" data-name="Статус · Готово">
            <p className="f60 f52 f5 f949 f480 f1095 f55 f56 f447 f58 f1063 f1053" data-node-id="86:3421">
              Готово
            </p>
          </div>
          <div className="f5 f1064 f991 f202" data-node-id="86:3422" data-name="next">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgNext} />
          </div>
          <p className="f52 f5 f165 f100 f480 f77 f968 f447 f1096 f1097" data-node-id="86:3424" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Фотографии напечатаны · скоро отправим
          </p>
        </div>
        <div className="f5 f147 f197 f694 f37 f1085 f173 f1 f858 f1098 f930" data-node-id="86:3425" data-name="Заказ №6403712 · Наше путешествие">
          <div className="f5 f108 f1087 f1020 f65" data-node-id="86:3426" data-name="Превью заказа">
            <div className="f5 f12 f13 f14 f1087">
              <img alt="" className="f5 f1099 f1100 f17 f1101 f745" src={img} />
            </div>
          </div>
          <p className="f52 f5 f53 f480 f474 f55 f56 f1059 f65 f1092" data-node-id="86:3427">
            Наше путешествие
          </p>
          <p className="f52 f5 f165 f100 f480 f474 f968 f447 f1060 f1066" data-node-id="86:3428" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            №6403712 · Classic
          </p>
          <div className="f5 f64 f1094 f474 f1 f1061 f27 f1102" data-node-id="86:3429" data-name="Статус · Передан в доставку">
            <p className="f60 f52 f5 f949 f480 f1103 f55 f56 f447 f58 f1063 f1102" data-node-id="86:3430">
              Передан в доставку
            </p>
          </div>
          <div className="f5 f1064 f991 f202" data-node-id="86:3431" data-name="next">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgNext} />
          </div>
          <p className="f52 f5 f165 f100 f480 f77 f968 f447 f1096 f1097" data-node-id="86:3433" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            Европочта · отследить доставку →
          </p>
        </div>
        <p className="f52 f5 f53 f480 f845 f55 f56 f1052 f1104 f825" data-node-id="86:3434">
          Завершённые
        </p>
        <a className="f5 f147 f6 f197 f694 f37 f7 f813 f173 f1 f858 f1105 f930" data-node-id="86:3435" data-name="Заказ №6403520 · Семейный альбом">
          <div className="f5 f882 f108 f933 f730 f1106" data-node-id="86:3436" data-name="Фотокнига «Лето внутри»">
            <div className="f5 f12 f13 f14 f933">
              <img alt="" className="f5 f936 f937 f17 f938 f939" src={img} />
            </div>
          </div>
          <p className="f52 f5 f53 f480 f1107 f55 f56 f1059 f135 f730 f1108" data-node-id="86:3437">
            Семейный альбом
          </p>
          <p className="f52 f5 f165 f100 f480 f1107 f968 f447 f135 f731 f295" data-node-id="86:3438" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            №6403520 · Classic
          </p>
          <div className="f5 f1109 f1094 f1107 f1 f1061 f27 f1062" data-node-id="86:3439" data-name="Статус · Получен">
            <p className="f60 f52 f5 f949 f480 f230 f55 f56 f447 f58 f1063 f1062" data-node-id="86:3440">
              Получен
            </p>
          </div>
          <div className="f5 f1064 f991 f202" data-node-id="86:3441" data-name="next">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgNext} />
          </div>
        </a>
      </div>
      <div className="f5 f298 f299 f300 f1 f301 f302 f303" data-node-id="86:3443" data-name="Поиск шаблона">
        <div className="f5 f304 f305 f306" data-node-id="86:3444" data-name="search">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgSearch} />
        </div>
        <p className="f52 f5 f165 f54 f307 f55 f269 f308 f309 f310" data-node-id="86:3446">
          Найти заказ
        </p>
      </div>
    </div>
  );
}
