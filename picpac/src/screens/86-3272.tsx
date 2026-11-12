import React from "react";
const assetPathPrefix = "/assets";
const img = `${assetPathPrefix}/2e7db.png`;
const imgGear = `${assetPathPrefix}/54f7b.svg`;
const imgCheck = `${assetPathPrefix}/e140b.svg`;
const imgCheck1 = `${assetPathPrefix}/ab29f.svg`;
const imgLayers = `${assetPathPrefix}/30f75.svg`;
const imgNext = `${assetPathPrefix}/1dd1f.svg`;
const imgChat = `${assetPathPrefix}/5283f.svg`;
const imgNext1 = `${assetPathPrefix}/c6ae3.svg`;
const imgLogout = `${assetPathPrefix}/147c1.svg`;
const imgWiFi = `${assetPathPrefix}/c2440.svg`;
const imgUnion = `${assetPathPrefix}/66795.svg`;
const imgPlus = `${assetPathPrefix}/3842b.svg`;
const imgHome = `${assetPathPrefix}/b3db4.svg`;
const imgGroup8 = `${assetPathPrefix}/3ebe6.svg`;
const imgEdit = `${assetPathPrefix}/259a9.svg`;
const imgPhone = `${assetPathPrefix}/50080.svg`;
const imgMail = `${assetPathPrefix}/2f11e.svg`;

export default function Screen({ui}: {ui: (element: React.ReactElement) => React.ReactNode}) {
  return ui(
    <div className="f0 f1 f2 f3 f4" data-node-id="86:3272" data-name="PicPac · Прототип / 1.1 · Профиль · Бренд v2">
      <p className="f60 f52 f5 f53 f480 f292 f55 f56 f918 f58 f27 f294 f919" data-node-id="86:3273">
        Профиль
      </p>
      <div className="f5 f920 f921 f922" data-node-id="86:3274" data-name="gear">
        <img alt="" className="f5 f6 f12 f17 f4" src={imgGear} />
      </div>
      <a className="f52 f5 f6 f7 f165 f100 f138 f923 f56 f924 f925 f310" data-node-id="86:3276" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
        <p className="f480">Все →</p>
      </a>
      <a className="f5 f147 f6 f694 f926 f37 f7 f927 f48 f1 f928 f929 f930" data-node-id="86:3277" data-name="Заказ №6403839">
        <div className="f5 f931 f932 f933 f934 f935" data-node-id="86:3278" data-name="Фотокнига «Лето внутри»">
          <div className="f5 f12 f13 f14 f933">
            <img alt="" className="f5 f936 f937 f17 f938 f939" src={img} />
          </div>
        </div>
        <p className="f52 f5 f53 f480 f940 f55 f56 f941 f135 f942 f943" data-node-id="86:3279">
          Моё лето
        </p>
        <div className="f5 f64 f944 f945 f1 f946 f947 f948" data-node-id="86:3280" data-name="В печати">
          <p className="f60 f52 f5 f949 f480 f950 f55 f56 f951 f58 f952 f294 f948" data-node-id="86:3281">
            В печати
          </p>
        </div>
        <p className="f52 f5 f53 f84 f480 f953 f56 f455 f135 f954 f955" data-node-id="86:3282" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
          №6403839 · Classic
        </p>
        <div className="f5 f781 f956 f957 f958 f959" data-node-id="86:3283" data-name="Разделитель" />
        <div className="f5 f45 f694 f926 f37 f960 f1 f961 f962 f963" data-node-id="86:3284" data-name="Принят">
          <div className="f5 f964 f965 f966" data-node-id="86:3285" data-name="check">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgCheck} />
          </div>
        </div>
        <p className="f60 f52 f5 f53 f480 f967 f55 f968 f969 f58 f970 f971" data-node-id="86:3287">
          Принят
        </p>
        <div className="f5 f45 f694 f926 f37 f972 f1 f961 f962 f963" data-node-id="86:3288" data-name="Оплата">
          <div className="f5 f964 f965 f966" data-node-id="86:3289" data-name="check">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgCheck1} />
          </div>
        </div>
        <p className="f60 f52 f5 f53 f480 f973 f55 f968 f969 f58 f970 f971" data-node-id="86:3291">
          Оплата
        </p>
        <div className="f5 f147 f694 f926 f37 f974 f961 f962 f963" data-node-id="86:3292" data-name="В печати" />
        <p className="f60 f52 f5 f53 f480 f975 f55 f968 f969 f58 f970 f971" data-node-id="86:3293">
          В печати
        </p>
        <div className="f5 f147 f694 f926 f37 f976 f961 f962 f963" data-node-id="86:3294" data-name="Готово" />
        <p className="f60 f52 f5 f53 f480 f977 f55 f968 f969 f58 f970 f971" data-node-id="86:3295">
          Готово
        </p>
      </a>
      <div className="f5 f147 f694 f926 f37 f978 f48 f1 f979 f980 f930" data-node-id="86:3296" data-name="Меню профиля">
        <a className="f5 f62 f7 f981 f982" data-node-id="86:3297">
          <div className="f5 f983 f984 f985" data-node-id="86:3298" data-name="layers">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgLayers} />
          </div>
          <p className="f52 f5 f53 f986 f480 f987 f55 f56 f988 f989 f476" data-node-id="86:3300">
            Мои дизайны
          </p>
          <div className="f5 f990 f991 f989" data-node-id="86:3301" data-name="next">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgNext} />
          </div>
          <p className="f52 f5 f53 f886 f480 f992 f55 f968 f455 f993 f994" data-node-id="86:3303">
            3 проекта
          </p>
        </a>
        <div className="f5 f781 f956 f995 f996 f997" data-node-id="86:3304" data-name="Разделитель" />
        <a className="f5 f62 f7 f981 f998" data-node-id="86:3305">
          <div className="f5 f983 f984 f999" data-node-id="86:3306" data-name="chat">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgChat} />
          </div>
          <a className="f52 f5 f6 f53 f138 f987 f55 f56 f988 f1000 f1001" data-node-id="86:3308">
            <p className="f480">Связаться с нами</p>
          </a>
          <div className="f5 f990 f991 f1000" data-node-id="86:3309" data-name="next">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgNext1} />
          </div>
        </a>
      </div>
      <div className="f5 f147 f694 f926 f37 f176 f48 f1 f1002 f1003 f930" data-node-id="86:3311" data-name="Выйти">
        <div className="f5 f1004 f984 f1005" data-node-id="86:3312" data-name="logout">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgLogout} />
        </div>
        <p className="f52 f5 f53 f480 f1006 f55 f56 f988 f1007 f1008" data-node-id="86:3314">
          Выйти
        </p>
      </div>
      <div className="f5 f0 f176 f173 f1 f177 f1009" data-node-id="86:3315" data-name="iOS · Строка состояния">
        <p className="f52 f5 f53 f178 f179 f55 f56 f313 f82 f713" data-node-id="86:3316">
          9:41
        </p>
        <div className="f5 f93 f182 f183 f184 f185 f186" data-node-id="86:3317" data-name="Сотовая связь" />
        <div className="f5 f93 f187 f188 f184 f189 f186" data-node-id="86:3318" data-name="Сотовая связь" />
        <div className="f5 f93 f190 f191 f184 f192 f186" data-node-id="86:3319" data-name="Сотовая связь" />
        <div className="f5 f93 f193 f194 f184 f195 f186" data-node-id="86:3320" data-name="Сотовая связь" />
        <div className="f5 f0 f197 f198 f37 f199 f200 f1 f201 f202 f203" data-node-id="86:3321" data-name="Батарея">
          <div className="f5 f93 f204 f205 f184 f206 f207" data-node-id="86:3322" data-name="Заряд" />
        </div>
        <div className="f5 f93 f208 f209 f184 f192 f210" data-node-id="86:3323" data-name="Контакт батареи" />
        <div className="f5 f211 f212 f213 f214" data-node-id="86:3324" data-name="Wi-Fi">
          <img alt="" className="f5 f6 f12 f17 f4" src={imgWiFi} />
        </div>
      </div>
      <p className="f52 f5 f165 f178 f567 f55 f391 f1010 f1011 f310" data-node-id="86:3327">
        Личные названия заказов видны только вам
      </p>
      <div className="f60 f5 f222 f61 f223 f150" data-node-id="86:3328">
        <div className="f60 f5 f62 f61 f145" data-node-id="86:3329">
          <div className="f5 f222 f173 f145 f150" data-node-id="86:3330" data-name="Union">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgUnion} />
          </div>
          <a className="f60 f5 f34 f6 f198 f224 f37 f7 f61 f1 f225 f226 f206" data-node-id="86:3333" data-name="Создать">
            <div className="f5 f227 f228 f229" data-node-id="86:3334" data-name="plus">
              <img alt="" className="f5 f6 f12 f17 f4" src={imgPlus} />
            </div>
          </a>
          <a className="f5 f62 f7 f234 f236" data-node-id="86:3336">
            <div className="f5 f234 f235 f236" data-node-id="86:3338" data-name="home">
              <img alt="" className="f5 f6 f12 f17 f4" src={imgHome} />
            </div>
          </a>
          <a className="f5 f6 f7 f232 f800 f231 f233" data-node-id="86:3340">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgGroup8} />
          </a>
        </div>
      </div>
      <a className="f52 f5 f6 f7 f53 f138 f567 f55 f56 f1012 f1013 f1014" data-node-id="86:3343">
        <p className="f480">История заказов</p>
      </a>
      <div className="f5 f34 f1015 f48 f1 f1016 f615 f1017" data-node-id="86:3344">
        <div className="f5 f1018 f1019 f1020 f82" data-node-id="86:3345" data-name="Анна — фото профиля">
          <div className="f5 f12 f13 f14 f1019">
            <img alt="" className="f5 f1021 f1022 f17 f1023 f1024" src={img} />
          </div>
        </div>
        <p className="f52 f5 f53 f480 f511 f55 f56 f1025 f202 f476" data-node-id="86:3346">
          Анна
        </p>
        <p className="f52 f5 f53 f480 f511 f55 f968 f941 f1026 f1027" data-node-id="86:3347">
          Личный кабинет
        </p>
        <div className="f5 f1028 f464 f1 f1029 f1030 f1031" data-node-id="86:3348" data-name="Редактировать профиль">
          <div className="f5 f1032 f962 f1033" data-node-id="86:3349" data-name="edit">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgEdit} />
          </div>
        </div>
        <div className="f5 f62 f1034 f1035" data-node-id="86:3351">
          <div className="f5 f1034 f1036 f1035" data-node-id="86:3352" data-name="phone">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgPhone} />
          </div>
          <p className="f52 f5 f53 f480 f1037 f55 f56 f941 f611 f1038" data-node-id="86:3354">
            +375 29 000-00-00
          </p>
          <div className="f5 f1034 f1036 f1039" data-node-id="86:3355" data-name="mail">
            <img alt="" className="f5 f6 f12 f17 f4" src={imgMail} />
          </div>
          <p className="f52 f5 f53 f480 f1037 f55 f56 f941 f1039 f1038" data-node-id="86:3357">
            anna@example.com
          </p>
        </div>
      </div>
    </div>
  );
}
