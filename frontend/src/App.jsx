import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const paymentMethodOptions = [
  { value: 'credit_card', label: 'Credit card' },
  { value: 'debit_card', label: 'Debit card' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'paypal', label: 'PayPal' },
]

const initialPropertyForm = {
  title: '',
  location: '',
  type: 'Hotel',
  image_url: '',
  stars: 4,
  rating: 8.5,
  reviews_count: 0,
  price_per_night: 120,
  max_guests: 2,
  free_cancellation: true,
  breakfast_included: true,
  pet_friendly: false,
  wifi_included: true,
  parking_included: false,
  room_size_sqm: 24,
  bed_type: 'Queen Bed',
  description: '',
}

const adminPageConfig = [
  { id: 'overview', label: 'Overview' },
  { id: 'properties', label: 'Properties' },
  { id: 'editor', label: 'Room editor' },
]

const publicPageConfig = [
  { id: 'stays', hash: '/', labelKey: 'nav_stays' },
  { id: 'attractions', hash: '/attractions', labelKey: 'nav_attractions' },
  { id: 'activities', hash: '/activities', labelKey: 'nav_activities' },
]

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'az', label: 'Azərbaycan dili' },
]

const translations = {
  en: {
    brand: 'TravelDesk',
    language_label: 'Language',
    nav_stays: 'Stays',
    nav_attractions: 'Attractions',
    nav_activities: 'Activities & experiences',
    nav_flights: 'Flights',
    nav_cars: 'Car rentals',
    hero_eyebrow: 'Hotels - homes - airbnbs',
    hero_title: 'Find your next stay',
    hero_subtitle: 'Browse 100 professional listings and open each room page for full amenities and booking info.',
    hero_guest_tip: 'Open room pages without login. Login only when you want to reserve and pay.',
    signed_in_as: 'Signed in as {name} ({role})',
    filter_location: 'Location',
    filter_location_placeholder: 'City or destination',
    filter_guests: 'Guests',
    filter_min_price: 'Min price',
    filter_max_price: 'Max price',
    filter_type: 'Type',
    filter_rating: 'Rating',
    filter_cancellation: 'Cancellation',
    filter_breakfast: 'Breakfast',
    filter_pets: 'Pets',
    filter_wifi: 'Wi-Fi',
    filter_parking: 'Parking',
    filter_order: 'Order',
    option_any: 'Any',
    option_hotel: 'Hotel',
    option_airbnb: 'Airbnb',
    option_free: 'Free',
    option_non_refundable: 'Non-refundable',
    option_included: 'Included',
    option_not_included: 'Not included',
    option_allowed: 'Allowed',
    option_not_allowed: 'Not allowed',
    option_top_rated: 'Top rated',
    option_most_booked: 'Most booked',
    option_price_low_high: 'Price low to high',
    option_price_high_low: 'Price high to low',
    option_rating_low_high: 'Rating low to high',
    stays_loading: 'Loading stays...',
    stays_available_now: '{count} stays available right now.',
    stays_no_match: 'No properties match your search.',
    card_breakfast_included: 'Breakfast included',
    card_no_breakfast: 'No breakfast',
    card_pet_friendly: 'Pet friendly',
    card_no_pets: 'No pets',
    card_add_favorite: 'Add to favorites',
    card_remove_favorite: 'Remove favorite',
    attractions_title: 'Tourist attractions',
    attractions_subtitle: 'Discover famous places and city highlights before you book your stay.',
    activities_title: 'Activities and experiences',
    activities_subtitle: 'Add guided tours, food experiences, and outdoor plans to your trip.',
    flights_title: 'Flight reservations',
    flights_subtitle: 'Compare departure options and prepare your route in one place.',
    cars_title: 'Car rentals',
    cars_subtitle: 'Choose a vehicle category and rental terms for local transportation.',
    discovery_hint: 'Full booking integration for this section can be connected from the same account panel.',
    discovery_how_to_label: 'How to do it',
    discovery_best_for_label: 'Best for',
    attractions_card_1_title: 'Old city walking routes',
    attractions_card_1_desc: 'Historic quarters, museums, and evening viewpoints with local guides.',
    attractions_card_2_title: 'Landmark passes',
    attractions_card_2_desc: 'One pass for top attractions with skip-the-line access and timings.',
    attractions_card_3_title: 'Family highlights',
    attractions_card_3_desc: 'Kid-friendly stops, parks, and short routes for all-day outings.',
    attractions_card_4_title: 'Architecture and art routes',
    attractions_card_4_desc: 'Design-focused districts, galleries, and curated photo points.',
    attractions_card_5_title: 'Museum evening circuit',
    attractions_card_5_desc: 'Late-opening museums and cultural halls with guided timelines.',
    attractions_card_6_title: 'Panorama viewpoint pack',
    attractions_card_6_desc: 'Sunrise and sunset lookouts with transport and access details.',
    activities_card_1_title: 'Food and culture tours',
    activities_card_1_desc: 'Taste local cuisine and join neighborhood storytelling experiences.',
    activities_card_2_title: 'Nature adventures',
    activities_card_2_desc: 'Boat rides, mountain viewpoints, and guided day trips.',
    activities_card_3_title: 'Night experiences',
    activities_card_3_desc: 'Live music, rooftop evenings, and city light photography walks.',
    activities_card_4_title: 'Wellness and spa days',
    activities_card_4_desc: 'Recovery programs, thermal spaces, and private relaxation sessions.',
    activities_card_5_title: 'Workshops and classes',
    activities_card_5_desc: 'Cooking, pottery, and local craft masterclasses with instructors.',
    activities_card_6_title: 'Family adventure parks',
    activities_card_6_desc: 'Zip-lines, water zones, and all-ages activity parks.',
    flights_card_1_title: 'Flexible date search',
    flights_card_1_desc: 'Check nearby dates to find lower prices and better connection options.',
    flights_card_2_title: 'Cabin preferences',
    flights_card_2_desc: 'Filter by cabin class, baggage policies, and refund conditions.',
    flights_card_3_title: 'Airport transfers',
    flights_card_3_desc: 'Bundle airport pickup details together with your travel schedule.',
    flights_card_4_title: 'Multi-city route planner',
    flights_card_4_desc: 'Plan complex itineraries with multiple destinations in one booking flow.',
    flights_card_5_title: 'Miles and loyalty filters',
    flights_card_5_desc: 'Prioritize alliances, frequent flyer programs, and points earnings.',
    flights_card_6_title: 'Price alert tracking',
    flights_card_6_desc: 'Monitor fare trends and trigger alerts when prices drop.',
    cars_card_1_title: 'Compact city cars',
    cars_card_1_desc: 'Easy parking options and fuel-efficient models for city travel.',
    cars_card_2_title: 'SUV and family class',
    cars_card_2_desc: 'Larger luggage capacity and comfort for longer routes.',
    cars_card_3_title: 'Premium rentals',
    cars_card_3_desc: 'Business-class vehicles with flexible pickup and return windows.',
    cars_card_4_title: 'Electric vehicle fleet',
    cars_card_4_desc: 'EV options with nearby charging station recommendations.',
    cars_card_5_title: 'One-way rental deals',
    cars_card_5_desc: 'Pick up and return in different cities with transparent terms.',
    cars_card_6_title: 'Chauffeur services',
    cars_card_6_desc: 'Professional driver packages for business or private travel days.',
    back_to_stays: 'Back to all stays',
    room_details_title: 'Room details',
    room_preview_tip: 'Preview room details without login. Login to reserve and pay.',
    logout: 'Logout',
    auth_title: 'Login / Register',
    auth_name_placeholder: 'Name',
    auth_email_placeholder: 'Email',
    auth_password_placeholder: 'Password',
    auth_create_guest: 'Create guest account',
    auth_login: 'Login',
    auth_switch_to_register: 'Switch to register',
    auth_switch_to_login: 'Switch to login',
    auth_switch_to: 'Switch to {mode}',
    auth_register: 'register',
    auth_admin_hint: 'Admin accounts are controlled by backend seeders/admins.',
    room_loading: 'Loading room details...',
    room_not_found: 'Room not found.',
    room_price_label: 'Price',
    unit_night: 'night',
    unit_sqm: 'sqm',
    room_guests_label: 'Guests',
    room_up_to: 'Up to {count}',
    room_rating_label: 'Rating',
    room_reviews: '{count} reviews',
    room_size_label: 'Room size',
    room_bed_type_label: 'Bed type',
    room_stars_label: 'Stars',
    room_features_title: 'Room features',
    room_breakfast_included: 'Breakfast included',
    room_breakfast_not_included: 'Breakfast not included',
    room_pet_friendly: 'Pet friendly',
    room_not_pet_friendly: 'Not pet friendly',
    room_wifi_included: 'Wi-Fi included',
    room_wifi_not_included: 'Wi-Fi not included',
    room_parking_included: 'Parking included',
    room_no_parking: 'No parking',
    room_free_cancellation: 'Free cancellation',
    room_non_refundable: 'Non-refundable',
    availability_30_days: 'Availability (next 30 days)',
    availability_loading: 'Loading availability...',
    reserve_room_title: 'Reserve this room',
    reserve_select_room: 'Select a room from the listing.',
    reserve_summary: '{location} - Up to {guests} guests',
    booking_full_name: 'Full name',
    booking_check_in: 'Check-in',
    booking_check_out: 'Check-out',
    booking_submit: 'Book now',
  },
  ru: {
    brand: 'TravelDesk',
    language_label: 'Язык',
    nav_stays: 'Проживание',
    nav_attractions: 'Достопримечательности',
    nav_activities: 'Активности и впечатления',
    nav_flights: 'Авиабилеты',
    nav_cars: 'Аренда авто',
    hero_eyebrow: 'Отели - дома - airbnb',
    hero_title: 'Найдите следующее проживание',
    hero_subtitle: 'Просматривайте 100 профессиональных вариантов и открывайте страницу каждого номера с полными удобствами.',
    hero_guest_tip: 'Открывайте страницы номеров без входа. Войдите только когда хотите бронировать и оплачивать.',
    signed_in_as: 'Вы вошли как {name} ({role})',
    filter_location: 'Локация',
    filter_location_placeholder: 'Город или направление',
    filter_guests: 'Гости',
    filter_min_price: 'Мин. цена',
    filter_max_price: 'Макс. цена',
    filter_type: 'Тип',
    filter_rating: 'Рейтинг',
    filter_cancellation: 'Отмена',
    filter_breakfast: 'Завтрак',
    filter_pets: 'Питомцы',
    filter_wifi: 'Wi-Fi',
    filter_parking: 'Парковка',
    filter_order: 'Порядок',
    option_any: 'Любой',
    option_hotel: 'Отель',
    option_airbnb: 'Airbnb',
    option_free: 'Бесплатно',
    option_non_refundable: 'Без возврата',
    option_included: 'Включено',
    option_not_included: 'Не включено',
    option_allowed: 'Разрешено',
    option_not_allowed: 'Не разрешено',
    option_top_rated: 'Лучший рейтинг',
    option_most_booked: 'Самые бронируемые',
    option_price_low_high: 'Цена по возрастанию',
    option_price_high_low: 'Цена по убыванию',
    option_rating_low_high: 'Рейтинг по возрастанию',
    stays_loading: 'Загрузка вариантов...',
    stays_available_now: 'Сейчас доступно вариантов: {count}.',
    stays_no_match: 'По вашему запросу ничего не найдено.',
    card_breakfast_included: 'Завтрак включен',
    card_no_breakfast: 'Без завтрака',
    card_pet_friendly: 'Можно с питомцами',
    card_no_pets: 'Без питомцев',
    card_add_favorite: 'Добавить в избранное',
    card_remove_favorite: 'Удалить из избранного',
    attractions_title: 'Туристические места',
    attractions_subtitle: 'Изучайте знаковые места и городские маршруты до бронирования проживания.',
    activities_title: 'Активности и впечатления',
    activities_subtitle: 'Добавляйте экскурсии, гастро-туры и активный отдых в план поездки.',
    flights_title: 'Бронирование авиабилетов',
    flights_subtitle: 'Сравнивайте рейсы и планируйте маршрут в одном интерфейсе.',
    cars_title: 'Аренда автомобилей',
    cars_subtitle: 'Выберите класс авто и условия аренды для передвижения по городу.',
    discovery_hint: 'Полную интеграцию бронирования этого раздела можно подключить в той же учетной панели.',
    discovery_how_to_label: 'Как это сделать',
    discovery_best_for_label: 'Подходит для',
    attractions_card_1_title: 'Пешие маршруты по старому городу',
    attractions_card_1_desc: 'Исторические кварталы, музеи и вечерние обзорные точки с гидом.',
    attractions_card_2_title: 'Единые билеты на локации',
    attractions_card_2_desc: 'Один пропуск для топовых мест с быстрым проходом и расписанием.',
    attractions_card_3_title: 'Семейные маршруты',
    attractions_card_3_desc: 'Парки, удобные остановки для детей и короткие прогулочные линии.',
    attractions_card_4_title: 'Маршруты архитектуры и искусства',
    attractions_card_4_desc: 'Дизайн-кварталы, галереи и фото-точки с отборными локациями.',
    attractions_card_5_title: 'Вечерний музейный круг',
    attractions_card_5_desc: 'Музеи с поздним графиком и культурные площадки с гидом.',
    attractions_card_6_title: 'Пакет панорамных точек',
    attractions_card_6_desc: 'Смотровые площадки на рассвет и закат с транспортом и доступом.',
    activities_card_1_title: 'Гастро и культурные туры',
    activities_card_1_desc: 'Местная кухня и авторские истории районов от гидов.',
    activities_card_2_title: 'Природные приключения',
    activities_card_2_desc: 'Прогулки на лодке, панорамные точки и дневные выезды.',
    activities_card_3_title: 'Вечерние впечатления',
    activities_card_3_desc: 'Живая музыка, крыши города и фотопрогулки по вечернему свету.',
    activities_card_4_title: 'Дни wellness и SPA',
    activities_card_4_desc: 'Программы восстановления, термальные зоны и приватный релакс.',
    activities_card_5_title: 'Воркшопы и мастер-классы',
    activities_card_5_desc: 'Кулинария, керамика и локальные ремесла с преподавателями.',
    activities_card_6_title: 'Семейные парки приключений',
    activities_card_6_desc: 'Зиплайн, водные зоны и активности для всех возрастов.',
    flights_card_1_title: 'Гибкий поиск по датам',
    flights_card_1_desc: 'Смотрите соседние даты, чтобы найти более выгодные варианты.',
    flights_card_2_title: 'Настройки класса перелета',
    flights_card_2_desc: 'Фильтрация по классу, багажу и условиям возврата.',
    flights_card_3_title: 'Трансфер из аэропорта',
    flights_card_3_desc: 'Объединяйте трансфер с расписанием прилета и вылета.',
    flights_card_4_title: 'Планировщик мульти-маршрутов',
    flights_card_4_desc: 'Собирайте сложные маршруты с несколькими городами в одном окне.',
    flights_card_5_title: 'Фильтры миль и программ',
    flights_card_5_desc: 'Приоритет по альянсам, бонусным программам и начислению баллов.',
    flights_card_6_title: 'Отслеживание цен',
    flights_card_6_desc: 'Следите за динамикой тарифов и получайте сигналы о снижении цены.',
    cars_card_1_title: 'Компактные городские авто',
    cars_card_1_desc: 'Удобная парковка и экономичный расход для городских поездок.',
    cars_card_2_title: 'SUV и семейный класс',
    cars_card_2_desc: 'Больше места для багажа и комфорт для длительных маршрутов.',
    cars_card_3_title: 'Премиум аренда',
    cars_card_3_desc: 'Бизнес-класс с гибкими окнами получения и возврата.',
    cars_card_4_title: 'Парк электромобилей',
    cars_card_4_desc: 'Электромобили с подсказками по ближайшим зарядным станциям.',
    cars_card_5_title: 'Сделки one-way аренды',
    cars_card_5_desc: 'Получение и возврат в разных городах с прозрачными условиями.',
    cars_card_6_title: 'Услуги водителя',
    cars_card_6_desc: 'Профессиональный водитель для деловых и личных маршрутов.',
    back_to_stays: 'Назад ко всем вариантам',
    room_details_title: 'Детали номера',
    room_preview_tip: 'Смотрите детали номера без входа. Для бронирования и оплаты войдите в систему.',
    logout: 'Выйти',
    auth_title: 'Вход / Регистрация',
    auth_name_placeholder: 'Имя',
    auth_email_placeholder: 'Эл. почта',
    auth_password_placeholder: 'Пароль',
    auth_create_guest: 'Создать гостевой аккаунт',
    auth_login: 'Войти',
    auth_switch_to_register: 'Перейти к регистрации',
    auth_switch_to_login: 'Перейти ко входу',
    auth_switch_to: 'Переключить на {mode}',
    auth_register: 'регистрацию',
    auth_admin_hint: 'Админ-аккаунты управляются сидерами/админами на backend.',
    room_loading: 'Загрузка данных номера...',
    room_not_found: 'Номер не найден.',
    room_price_label: 'Цена',
    unit_night: 'ночь',
    unit_sqm: 'кв.м',
    room_guests_label: 'Гости',
    room_up_to: 'До {count}',
    room_rating_label: 'Рейтинг',
    room_reviews: '{count} отзывов',
    room_size_label: 'Размер номера',
    room_bed_type_label: 'Тип кровати',
    room_stars_label: 'Звезды',
    room_features_title: 'Удобства номера',
    room_breakfast_included: 'Завтрак включен',
    room_breakfast_not_included: 'Завтрак не включен',
    room_pet_friendly: 'Можно с питомцами',
    room_not_pet_friendly: 'Без питомцев',
    room_wifi_included: 'Wi-Fi включен',
    room_wifi_not_included: 'Wi-Fi не включен',
    room_parking_included: 'Парковка включена',
    room_no_parking: 'Парковки нет',
    room_free_cancellation: 'Бесплатная отмена',
    room_non_refundable: 'Без возврата',
    availability_30_days: 'Доступность (на 30 дней)',
    availability_loading: 'Загрузка доступности...',
    reserve_room_title: 'Забронировать этот номер',
    reserve_select_room: 'Выберите номер из списка.',
    reserve_summary: '{location} - До {guests} гостей',
    booking_full_name: 'Полное имя',
    booking_check_in: 'Заезд',
    booking_check_out: 'Выезд',
    booking_submit: 'Забронировать',
  },
  az: {
    brand: 'TravelDesk',
    language_label: 'Dil',
    nav_stays: 'Qalma yerləri',
    nav_attractions: 'Görməli yerlər',
    nav_activities: 'Fəaliyyətlər və təcrübələr',
    nav_flights: 'Uçuşlar',
    nav_cars: 'Avtomobil icarəsi',
    hero_eyebrow: 'Otellər - evlər - airbnb',
    hero_title: 'Növbəti qalma yerini tapın',
    hero_subtitle: '100 peşəkar elanı nəzərdən keçirin və hər otaq səhifəsində tam imkanları görün.',
    hero_guest_tip: 'Giriş etmədən otaq səhifələrini aça bilərsiniz. Yalnız rezervasiya və ödəniş üçün giriş edin.',
    signed_in_as: '{name} olaraq daxil olmusunuz ({role})',
    filter_location: 'Məkan',
    filter_location_placeholder: 'Şəhər və ya istiqamət',
    filter_guests: 'Qonaq sayı',
    filter_min_price: 'Min qiymət',
    filter_max_price: 'Maks qiymət',
    filter_type: 'Növ',
    filter_rating: 'Reytinq',
    filter_cancellation: 'Ləğv',
    filter_breakfast: 'Səhər yeməyi',
    filter_pets: 'Ev heyvanı',
    filter_wifi: 'Wi-Fi',
    filter_parking: 'Parkinq',
    filter_order: 'Sıralama',
    option_any: 'Fərqi yoxdur',
    option_hotel: 'Otel',
    option_airbnb: 'Airbnb',
    option_free: 'Pulsuz',
    option_non_refundable: 'Geri qaytarılmır',
    option_included: 'Daxildir',
    option_not_included: 'Daxil deyil',
    option_allowed: 'İcazə verilir',
    option_not_allowed: 'İcazə verilmir',
    option_top_rated: 'Ən yüksək reytinq',
    option_most_booked: 'Ən çox bron olunan',
    option_price_low_high: 'Qiymət artan',
    option_price_high_low: 'Qiymət azalan',
    option_rating_low_high: 'Reytinq artan',
    stays_loading: 'Qalma yerləri yüklənir...',
    stays_available_now: 'Hazırda mövcud qalma sayı: {count}.',
    stays_no_match: 'Axtarışınıza uyğun məkan tapılmadı.',
    card_breakfast_included: 'Səhər yeməyi daxildir',
    card_no_breakfast: 'Səhər yeməyi yoxdur',
    card_pet_friendly: 'Ev heyvanı ilə mümkündür',
    card_no_pets: 'Ev heyvanı olmaz',
    card_add_favorite: 'Seçilmişlərə əlavə et',
    card_remove_favorite: 'Seçilmişlərdən sil',
    attractions_title: 'Turistik görməli yerlər',
    attractions_subtitle: 'Qalma yerini bron etməzdən əvvəl məşhur məkanları və şəhər marşrutlarını planlayın.',
    activities_title: 'Fəaliyyətlər və təcrübələr',
    activities_subtitle: 'Tur, gastronomiya və açıq hava fəaliyyətlərini səfər planına əlavə edin.',
    flights_title: 'Uçuş rezervasiyaları',
    flights_subtitle: 'Uçuş seçimlərini müqayisə edin və marşrutunuzu bir yerdən idarə edin.',
    cars_title: 'Avtomobil icarəsi',
    cars_subtitle: 'Şəhərdaxili hərəkət üçün avtomobil sinfini və icarə şərtlərini seçin.',
    discovery_hint: 'Bu bölmə üçün tam bron inteqrasiyası eyni hesab panelinə qoşula bilər.',
    discovery_how_to_label: 'Necə etmək olar',
    discovery_best_for_label: 'Uyğundur',
    attractions_card_1_title: 'Köhnə şəhər piyada marşrutları',
    attractions_card_1_desc: 'Tarixi məhəllələr, muzeylər və axşam panoram nöqtələri bələdçi ilə.',
    attractions_card_2_title: 'Məkan keçid paketləri',
    attractions_card_2_desc: 'Ən məşhur məkanlara sürətli giriş və vaxt cədvəli ilə vahid keçid.',
    attractions_card_3_title: 'Ailə üçün seçimlər',
    attractions_card_3_desc: 'Uşaqlar üçün uyğun dayanacaqlar, parklar və qısa marşrutlar.',
    attractions_card_4_title: 'Memarlıq və incəsənət marşrutları',
    attractions_card_4_desc: 'Dizayn məhəllələri, qalereyalar və seçilmiş foto nöqtələri.',
    attractions_card_5_title: 'Muzey axşam marşrutu',
    attractions_card_5_desc: 'Gec açıq muzeylər və bələdçili mədəni məkanlar.',
    attractions_card_6_title: 'Panorama baxış paketləri',
    attractions_card_6_desc: 'Gün doğumu və batımı nöqtələri üçün giriş və nəqliyyat məlumatı.',
    activities_card_1_title: 'Yemək və mədəniyyət turları',
    activities_card_1_desc: 'Yerli mətbəx dadımı və məhəllə hekayələri ilə təcrübə.',
    activities_card_2_title: 'Təbiət macəraları',
    activities_card_2_desc: 'Qayıq turları, dağ mənzərələri və gündəlik ekskursiyalar.',
    activities_card_3_title: 'Axşam təcrübələri',
    activities_card_3_desc: 'Canlı musiqi, damüstü məkanlar və gecə foto gəzintiləri.',
    activities_card_4_title: 'Wellness və SPA günləri',
    activities_card_4_desc: 'Bərpa proqramları, termal zonalar və rahatlama sessiyaları.',
    activities_card_5_title: 'Workshop və masterklasslar',
    activities_card_5_desc: 'Kulinariya, keramika və yerli sənət üzrə dərslər.',
    activities_card_6_title: 'Ailə macəra parkları',
    activities_card_6_desc: 'Zipline, su zonaları və bütün yaşlara uyğun əyləncələr.',
    flights_card_1_title: 'Çevik tarix axtarışı',
    flights_card_1_desc: 'Yaxın tarixlərdə daha sərfəli qiymət və əlaqə seçimlərini görün.',
    flights_card_2_title: 'Kabin seçimləri',
    flights_card_2_desc: 'Kabin sinfi, baqaj qaydası və geri qaytarma şərtlərinə görə filtr.',
    flights_card_3_title: 'Hava limanı transferi',
    flights_card_3_desc: 'Transfer planını uçuş cədvəli ilə birlikdə idarə edin.',
    flights_card_4_title: 'Çoxşəhərli marşrut planlayıcısı',
    flights_card_4_desc: 'Bir rezervasiya axınında bir neçə şəhərli uçuş planları qurun.',
    flights_card_5_title: 'Mile və loyallıq filtrləri',
    flights_card_5_desc: 'Alyans, bonus proqramı və bal qazanma seçimlərinə üstünlük verin.',
    flights_card_6_title: 'Qiymət izləmə',
    flights_card_6_desc: 'Tarif dəyişimini izləyin və qiymət düşəndə bildiriş alın.',
    cars_card_1_title: 'Kompakt şəhər avtomobilləri',
    cars_card_1_desc: 'Şəhər daxilində rahat park və iqtisadi yanacaq sərfiyyatı.',
    cars_card_2_title: 'SUV və ailə sinfi',
    cars_card_2_desc: 'Uzun marşrutlar üçün daha geniş baqaj yeri və rahatlıq.',
    cars_card_3_title: 'Premium icarə',
    cars_card_3_desc: 'Elastik təhvil və qaytarma saatları olan biznes sinif avtomobillər.',
    cars_card_4_title: 'Elektrikli avtomobil parkı',
    cars_card_4_desc: 'Yaxın şarj məntəqəsi tövsiyələri ilə EV seçimləri.',
    cars_card_5_title: 'Bir istiqamətli icarə təklifləri',
    cars_card_5_desc: 'Fərqli şəhərdə təhvil-qaytarma üçün şəffaf şərtlər.',
    cars_card_6_title: 'Sürücülü xidmətlər',
    cars_card_6_desc: 'Biznes və şəxsi səfərlər üçün peşəkar sürücü paketləri.',
    back_to_stays: 'Bütün qalma yerlərinə qayıt',
    room_details_title: 'Otaq detalları',
    room_preview_tip: 'Giriş etmədən otaq detallarını görün. Rezervasiya və ödəniş üçün daxil olun.',
    logout: 'Çıxış',
    auth_title: 'Giriş / Qeydiyyat',
    auth_name_placeholder: 'Ad',
    auth_email_placeholder: 'E-poçt',
    auth_password_placeholder: 'Şifrə',
    auth_create_guest: 'Qonaq hesabı yarat',
    auth_login: 'Daxil ol',
    auth_switch_to_register: 'Qeydiyyata keç',
    auth_switch_to_login: 'Girişə keç',
    auth_switch_to: '{mode} rejiminə keç',
    auth_register: 'qeydiyyat',
    auth_admin_hint: 'Admin hesabları backend seeder/adminləri tərəfindən idarə olunur.',
    room_loading: 'Otaq detalları yüklənir...',
    room_not_found: 'Otaq tapılmadı.',
    room_price_label: 'Qiymət',
    unit_night: 'gecə',
    unit_sqm: 'kv.m',
    room_guests_label: 'Qonaqlar',
    room_up_to: 'Maksimum {count}',
    room_rating_label: 'Reytinq',
    room_reviews: '{count} rəy',
    room_size_label: 'Otaq ölçüsü',
    room_bed_type_label: 'Yataq növü',
    room_stars_label: 'Ulduzlar',
    room_features_title: 'Otaq xüsusiyyətləri',
    room_breakfast_included: 'Səhər yeməyi daxildir',
    room_breakfast_not_included: 'Səhər yeməyi daxil deyil',
    room_pet_friendly: 'Ev heyvanı ilə mümkündür',
    room_not_pet_friendly: 'Ev heyvanı ilə mümkün deyil',
    room_wifi_included: 'Wi-Fi daxildir',
    room_wifi_not_included: 'Wi-Fi daxil deyil',
    room_parking_included: 'Parkinq daxildir',
    room_no_parking: 'Parkinq yoxdur',
    room_free_cancellation: 'Pulsuz ləğv',
    room_non_refundable: 'Geri qaytarılmır',
    availability_30_days: 'Mövcudluq (növbəti 30 gün)',
    availability_loading: 'Mövcudluq yüklənir...',
    reserve_room_title: 'Bu otağı rezerv et',
    reserve_select_room: 'Siyahıdan bir otaq seçin.',
    reserve_summary: '{location} - Maksimum {guests} qonaq',
    booking_full_name: 'Tam ad',
    booking_check_in: 'Giriş tarixi',
    booking_check_out: 'Çıxış tarixi',
    booking_submit: 'İndi bron et',
  },
}

const publicPageMeta = {
  stays: { titleKey: 'hero_title', subtitleKey: 'hero_subtitle' },
  attractions: { titleKey: 'attractions_title', subtitleKey: 'attractions_subtitle' },
  activities: { titleKey: 'activities_title', subtitleKey: 'activities_subtitle' },
}

const publicPageCards = {
  attractions: [
    { titleKey: 'attractions_card_1_title', descriptionKey: 'attractions_card_1_desc' },
    { titleKey: 'attractions_card_2_title', descriptionKey: 'attractions_card_2_desc' },
    { titleKey: 'attractions_card_3_title', descriptionKey: 'attractions_card_3_desc' },
    { titleKey: 'attractions_card_4_title', descriptionKey: 'attractions_card_4_desc' },
    { titleKey: 'attractions_card_5_title', descriptionKey: 'attractions_card_5_desc' },
    { titleKey: 'attractions_card_6_title', descriptionKey: 'attractions_card_6_desc' },
  ],
  activities: [
    { titleKey: 'activities_card_1_title', descriptionKey: 'activities_card_1_desc' },
    { titleKey: 'activities_card_2_title', descriptionKey: 'activities_card_2_desc' },
    { titleKey: 'activities_card_3_title', descriptionKey: 'activities_card_3_desc' },
    { titleKey: 'activities_card_4_title', descriptionKey: 'activities_card_4_desc' },
    { titleKey: 'activities_card_5_title', descriptionKey: 'activities_card_5_desc' },
    { titleKey: 'activities_card_6_title', descriptionKey: 'activities_card_6_desc' },
  ],
}

const localizedPublicCardsByLanguage = {
  en: {
    attractions: [
      { id: 'en-attractions-1', title: 'Old city walking routes', description: 'Historic quarters, museums, and scenic evening viewpoints with local guides.' },
      { id: 'en-attractions-2', title: 'Landmark passes', description: 'One pass for top attractions with skip-the-line entry and fixed timeslots.' },
      { id: 'en-attractions-3', title: 'Family highlights', description: 'Kid-friendly parks, interactive exhibits, and easy half-day routes.' },
      { id: 'en-attractions-4', title: 'Architecture and art routes', description: 'Design districts, galleries, and curated photo points for culture lovers.' },
      { id: 'en-attractions-5', title: 'Museum evening circuit', description: 'Late-opening museums and cultural halls with guided story-based tours.' },
      { id: 'en-attractions-6', title: 'Panorama viewpoint pack', description: 'Sunrise and sunset lookouts with transport details and timing tips.' },
      { id: 'en-attractions-7', title: 'Riverside promenade', description: 'Waterfront walks, bridge views, and relaxing cafe stops.' },
      { id: 'en-attractions-8', title: 'Botanical gardens', description: 'Seasonal flower routes, greenhouse visits, and nature rest zones.' },
      { id: 'en-attractions-9', title: 'Archaeology district', description: 'Ancient ruins, excavation sites, and expert-led heritage stories.' },
      { id: 'en-attractions-10', title: 'Historic fortress walls', description: 'Defensive towers, old city gates, and panoramic wall-top walks.' },
      { id: 'en-attractions-11', title: 'Cultural heritage square', description: 'Traditional performance spots and artisan corners in the city center.' },
      { id: 'en-attractions-12', title: 'Street art neighborhood', description: 'Creative murals, indie studios, and urban visual culture trails.' },
      { id: 'en-attractions-13', title: 'Cathedral and sacred sites', description: 'Iconic religious architecture and peaceful heritage landmarks.' },
      { id: 'en-attractions-14', title: 'Royal palace route', description: 'Historic palace interiors, ceremonial halls, and royal gardens.' },
      { id: 'en-attractions-15', title: 'Coastal lighthouse trip', description: 'Sea-facing towers, cliff viewpoints, and maritime history stops.' },
      { id: 'en-attractions-16', title: 'Scenic bridge viewpoints', description: 'Top bridge observation points for skyline and river photography.' },
      { id: 'en-attractions-17', title: 'Historic market quarter', description: 'Traditional bazaars, spice shops, and local handcrafted goods.' },
      { id: 'en-attractions-18', title: 'Mountain lookout points', description: 'High-altitude overlooks with shuttle access and short hiking options.' },
      { id: 'en-attractions-19', title: 'UNESCO heritage circuit', description: 'Protected monuments and officially recognized cultural sites.' },
      { id: 'en-attractions-20', title: 'Local craft village', description: 'Live workshops, artisan studios, and handmade souvenir spots.' },
      { id: 'en-attractions-21', title: 'Wine region day tour', description: 'Countryside vineyards, cellar tastings, and scenic estate visits.' },
      { id: 'en-attractions-22', title: 'Island ferry landmarks', description: 'Short ferry rides to iconic harbor monuments and historic piers.' },
      { id: 'en-attractions-23', title: 'Night city viewpoints', description: 'Best evening skyline platforms and illuminated landmark routes.' },
      { id: 'en-attractions-24', title: 'Photography hotspots trail', description: 'Most photogenic streets, plazas, and architecture framing points.' },
    ],
    activities: [
      { id: 'en-activities-1', title: 'Food and culture tours', description: 'Taste local cuisine and join neighborhood storytelling experiences.' },
      { id: 'en-activities-2', title: 'Nature adventures', description: 'Boat rides, mountain viewpoints, and guided day trips.' },
      { id: 'en-activities-3', title: 'Night experiences', description: 'Live music, rooftop evenings, and city light photography walks.' },
      { id: 'en-activities-4', title: 'Wellness and spa days', description: 'Recovery programs, thermal spaces, and private relaxation sessions.' },
      { id: 'en-activities-5', title: 'Workshops and classes', description: 'Cooking, pottery, and local craft masterclasses with instructors.' },
      { id: 'en-activities-6', title: 'Family adventure parks', description: 'Zip-lines, water zones, and all-ages activity parks.' },
      { id: 'en-activities-7', title: 'Cycling city tours', description: 'Guided bike routes through districts, parks, and hidden streets.' },
      { id: 'en-activities-8', title: 'Kayak and paddle trips', description: 'Calm-water paddling plans with safety gear and route options.' },
      { id: 'en-activities-9', title: 'Hiking and trekking plans', description: 'Trail maps, local guides, and elevation-based difficulty options.' },
      { id: 'en-activities-10', title: 'Cooking masterclasses', description: 'Hands-on sessions with regional dishes and chef-led techniques.' },
      { id: 'en-activities-11', title: 'Local dance sessions', description: 'Cultural dance evenings with beginner-friendly instruction.' },
      { id: 'en-activities-12', title: 'Live music evenings', description: 'Jazz bars, unplugged sets, and traditional performance halls.' },
      { id: 'en-activities-13', title: 'Boat sunset cruises', description: 'Golden-hour cruises with harbor routes and skyline views.' },
      { id: 'en-activities-14', title: 'Hot air balloon rides', description: 'Early-morning flights with panoramic landscapes and photo stops.' },
      { id: 'en-activities-15', title: 'Ski and snow activities', description: 'Winter slopes, gear rentals, and group lesson options.' },
      { id: 'en-activities-16', title: 'Beach sports packages', description: 'Surf basics, beach volleyball, and guided coastal games.' },
      { id: 'en-activities-17', title: 'Yoga retreat mornings', description: 'Sunrise yoga, breathing sessions, and mindful wellness routines.' },
      { id: 'en-activities-18', title: 'Photography walks', description: 'Street photography routes with framing and lighting guidance.' },
      { id: 'en-activities-19', title: 'Escape room games', description: 'Team puzzle missions with themed rooms and timed challenges.' },
      { id: 'en-activities-20', title: 'Theme park passes', description: 'Entry bundles for rides, family zones, and entertainment shows.' },
      { id: 'en-activities-21', title: 'Art studio sessions', description: 'Painting and sculpture workshops with local creative mentors.' },
      { id: 'en-activities-22', title: 'Street food tasting', description: 'Guided tastings across top local snack and market corners.' },
      { id: 'en-activities-23', title: 'Horseback riding trips', description: 'Countryside riding trails for beginner and advanced levels.' },
      { id: 'en-activities-24', title: 'Camping and stargazing', description: 'Night camps, astronomy-friendly locations, and guided sky talks.' },
    ],
  },
  ru: {
    attractions: [
      { id: 'ru-attractions-1', title: 'Пешие маршруты по старому городу', description: 'Исторические кварталы, музеи и обзорные точки с местным гидом.' },
      { id: 'ru-attractions-2', title: 'Пакеты прохода к достопримечательностям', description: 'Единый пропуск для популярных мест с удобными слотами посещения.' },
      { id: 'ru-attractions-3', title: 'Семейные локации', description: 'Парки, интерактивные зоны и короткие маршруты для детей.' },
      { id: 'ru-attractions-4', title: 'Маршруты архитектуры и искусства', description: 'Дизайн-кварталы, галереи и лучшие точки для фото.' },
      { id: 'ru-attractions-5', title: 'Вечерний музейный круг', description: 'Музеи с поздним режимом и культурные площадки с сопровождением.' },
      { id: 'ru-attractions-6', title: 'Пакет панорамных точек', description: 'Локации для рассвета и заката с логистикой и таймингом.' },
      { id: 'ru-attractions-7', title: 'Набережная и прогулочные зоны', description: 'Маршруты вдоль воды, мосты и уютные остановки в кафе.' },
      { id: 'ru-attractions-8', title: 'Ботанические сады', description: 'Сезонные цветочные маршруты, оранжереи и зоны отдыха.' },
      { id: 'ru-attractions-9', title: 'Археологический район', description: 'Древние раскопки, руины и исторические экскурсии.' },
      { id: 'ru-attractions-10', title: 'Крепостные стены и башни', description: 'Старые ворота города, оборонные линии и обзорные проходы.' },
      { id: 'ru-attractions-11', title: 'Площадь культурного наследия', description: 'Традиционные выступления и ремесленные уголки в центре.' },
      { id: 'ru-attractions-12', title: 'Район стрит-арта', description: 'Муралы, авторские студии и городские арт-маршруты.' },
      { id: 'ru-attractions-13', title: 'Соборы и священные места', description: 'Знаковые религиозные памятники и тихие исторические локации.' },
      { id: 'ru-attractions-14', title: 'Маршрут королевского дворца', description: 'Залы дворца, парадные пространства и исторические сады.' },
      { id: 'ru-attractions-15', title: 'Поездка к маякам побережья', description: 'Морские виды, скальные площадки и объекты морской истории.' },
      { id: 'ru-attractions-16', title: 'Смотровые точки на мостах', description: 'Лучшие виды на город и реку с мостовых платформ.' },
      { id: 'ru-attractions-17', title: 'Исторический рыночный квартал', description: 'Базары, лавки специй и местные ремесленные товары.' },
      { id: 'ru-attractions-18', title: 'Горные смотровые площадки', description: 'Высотные виды с трансфером и короткими пешими маршрутами.' },
      { id: 'ru-attractions-19', title: 'Маршрут объектов ЮНЕСКО', description: 'Охраняемые памятники и официально признанные культурные места.' },
      { id: 'ru-attractions-20', title: 'Деревня локальных ремесел', description: 'Живые мастерские и площадки с ручной работой.' },
      { id: 'ru-attractions-21', title: 'Винный регион на день', description: 'Виноградники, дегустации и загородные винодельни.' },
      { id: 'ru-attractions-22', title: 'Паром к островным объектам', description: 'Короткие рейсы к знаковым пирсам и островным точкам.' },
      { id: 'ru-attractions-23', title: 'Ночные панорамы города', description: 'Площадки с вечерним видом на освещенные кварталы.' },
      { id: 'ru-attractions-24', title: 'Фотомаршрут по лучшим точкам', description: 'Самые фотогеничные улицы, площади и архитектурные ракурсы.' },
    ],
    activities: [
      { id: 'ru-activities-1', title: 'Гастро и культурные туры', description: 'Локальная кухня и истории районов с сопровождением.' },
      { id: 'ru-activities-2', title: 'Природные приключения', description: 'Лодки, горные панорамы и выезды на природу.' },
      { id: 'ru-activities-3', title: 'Вечерние впечатления', description: 'Живая музыка, крыши города и ночные фотопрогулки.' },
      { id: 'ru-activities-4', title: 'Wellness и SPA дни', description: 'Программы восстановления, термальные зоны и релакс-сессии.' },
      { id: 'ru-activities-5', title: 'Мастер-классы и занятия', description: 'Кулинария, керамика и ремесленные классы.' },
      { id: 'ru-activities-6', title: 'Семейные парки приключений', description: 'Зиплайн, водные зоны и развлечения для всех возрастов.' },
      { id: 'ru-activities-7', title: 'Велотуры по городу', description: 'Маршруты на велосипеде через парки и исторические районы.' },
      { id: 'ru-activities-8', title: 'Каяк и сап-программы', description: 'Спокойные водные маршруты с экипировкой и инструктажем.' },
      { id: 'ru-activities-9', title: 'Походы и треккинг', description: 'Тропы разной сложности с картами и локальными гидами.' },
      { id: 'ru-activities-10', title: 'Кулинарные мастер-классы', description: 'Практика региональных блюд с шеф-поварами.' },
      { id: 'ru-activities-11', title: 'Сессии местных танцев', description: 'Танцевальные вечера с базовым обучением для гостей.' },
      { id: 'ru-activities-12', title: 'Вечера живой музыки', description: 'Джаз, акустика и традиционные концертные площадки.' },
      { id: 'ru-activities-13', title: 'Круизы на закате', description: 'Вечерние маршруты по воде с видами на город.' },
      { id: 'ru-activities-14', title: 'Полеты на воздушном шаре', description: 'Утренние полеты с панорамами и фото-остановками.' },
      { id: 'ru-activities-15', title: 'Снег и горнолыжные активности', description: 'Склоны, прокат снаряжения и групповые занятия.' },
      { id: 'ru-activities-16', title: 'Пляжные спортивные пакеты', description: 'Серф-базис, пляжный волейбол и активные игры у моря.' },
      { id: 'ru-activities-17', title: 'Утренние йога-ретриты', description: 'Практики на рассвете, дыхательные сессии и mindfulness.' },
      { id: 'ru-activities-18', title: 'Фотопрогулки по городу', description: 'Маршруты с акцентом на композицию и свет.' },
      { id: 'ru-activities-19', title: 'Escape room игры', description: 'Командные квесты и сценарные комнаты на время.' },
      { id: 'ru-activities-20', title: 'Пакеты в тематические парки', description: 'Единые входные решения на аттракционы и шоу.' },
      { id: 'ru-activities-21', title: 'Сессии в арт-студиях', description: 'Живопись и скульптура с местными художниками.' },
      { id: 'ru-activities-22', title: 'Street food дегустации', description: 'Маршруты по лучшим точкам местной уличной кухни.' },
      { id: 'ru-activities-23', title: 'Конные прогулки', description: 'Загородные маршруты для новичков и опытных участников.' },
      { id: 'ru-activities-24', title: 'Кемпинг и наблюдение за звездами', description: 'Ночные лагеря, площадки для астрономии и гид-сопровождение.' },
    ],
  },
  az: {
    attractions: [
      { id: 'az-attractions-1', title: 'Köhnə şəhər piyada marşrutları', description: 'Tarixi məhəllələr, muzeylər və axşam mənzərə nöqtələri bələdçi ilə.' },
      { id: 'az-attractions-2', title: 'Məkan keçid paketləri', description: 'Məşhur məkanlar üçün vahid giriş paketi və rahat vaxt seçimi.' },
      { id: 'az-attractions-3', title: 'Ailə üçün seçimlər', description: 'Uşaqlar üçün uyğun parklar və qısa, rahat marşrutlar.' },
      { id: 'az-attractions-4', title: 'Memarlıq və incəsənət marşrutları', description: 'Dizayn məhəllələri, qalereyalar və foto üçün ən yaxşı nöqtələr.' },
      { id: 'az-attractions-5', title: 'Muzey axşam marşrutu', description: 'Gec açıq muzeylər və mədəni məkanlar üzrə bələdçili tur.' },
      { id: 'az-attractions-6', title: 'Panorama baxış paketləri', description: 'Gün doğumu və batımı üçün baxış nöqtələri və nəqliyyat məlumatı.' },
      { id: 'az-attractions-7', title: 'Sahil bulvarı gəzintisi', description: 'Dənizkənarı marşrutlar, körpü mənzərələri və rahat dayanacaqlar.' },
      { id: 'az-attractions-8', title: 'Botanik bağlar', description: 'Mövsümi çiçək marşrutları, istixanalar və təbiət istirahət zonaları.' },
      { id: 'az-attractions-9', title: 'Arxeoloji ərazi', description: 'Qədim qalıqlar, qazıntı zonaları və tarixi bələdçi turları.' },
      { id: 'az-attractions-10', title: 'Qala divarları və bürclər', description: 'Tarixi şəhər qapıları və yüksək baxış nöqtələri ilə marşrut.' },
      { id: 'az-attractions-11', title: 'Mədəni irs meydanı', description: 'Ənənəvi çıxışlar və sənətkarlıq guşələri ilə mərkəzi zona.' },
      { id: 'az-attractions-12', title: 'Street-art məhəlləsi', description: 'Mural divarlar, yaradıcı studiyalar və şəhər sənət marşrutu.' },
      { id: 'az-attractions-13', title: 'Kafedral və müqəddəs məkanlar', description: 'Memarlıq baxımından önəmli dini və tarixi obyektlər.' },
      { id: 'az-attractions-14', title: 'Saray marşrutu', description: 'Tarixi saray interyeri, rəsmi zallar və bağlar.' },
      { id: 'az-attractions-15', title: 'Mayak sahil səfəri', description: 'Dəniz mənzərələri, sahil nöqtələri və dəniz tarixi obyektləri.' },
      { id: 'az-attractions-16', title: 'Körpü baxış nöqtələri', description: 'Şəhər silueti və çay mənzərəsi üçün ən yaxşı nöqtələr.' },
      { id: 'az-attractions-17', title: 'Tarixi bazar məhəlləsi', description: 'Ənənəvi bazarlar, ədviyyat dükanları və yerli əl işləri.' },
      { id: 'az-attractions-18', title: 'Dağ baxış məntəqələri', description: 'Yüksək nöqtələrə transfer və qısa yürüş variantları.' },
      { id: 'az-attractions-19', title: 'UNESCO irs marşrutu', description: 'Qorunan tarixi obyektlər və rəsmi mədəni irs nöqtələri.' },
      { id: 'az-attractions-20', title: 'Yerli sənətkarlıq kəndi', description: 'Canlı emalatxanalar və əl istehsalı suvenir məkanları.' },
      { id: 'az-attractions-21', title: 'Şərab bölgəsi günlük turu', description: 'Bağ sahələri, dequstasiya proqramları və kənd mənzərələri.' },
      { id: 'az-attractions-22', title: 'Ada və bərə marşrutları', description: 'Qısa bərə səfərləri ilə liman və ada görməli məkanları.' },
      { id: 'az-attractions-23', title: 'Gecə şəhər panoramları', description: 'İşıqlı şəhər mənzərəsi üçün axşam baxış platformaları.' },
      { id: 'az-attractions-24', title: 'Foto marşrut xətti', description: 'Ən fotogenik küçə, meydan və memarlıq nöqtələrinin siyahısı.' },
    ],
    activities: [
      { id: 'az-activities-1', title: 'Yemək və mədəniyyət turları', description: 'Yerli mətbəx dadımı və məhəllə hekayələri ilə təcrübə.' },
      { id: 'az-activities-2', title: 'Təbiət macəraları', description: 'Qayıq turları, dağ mənzərələri və gündəlik çıxışlar.' },
      { id: 'az-activities-3', title: 'Axşam təcrübələri', description: 'Canlı musiqi, damüstü məkanlar və gecə foto gəzintiləri.' },
      { id: 'az-activities-4', title: 'Wellness və SPA günləri', description: 'Bərpa proqramları, termal zonalar və rahatlama seansları.' },
      { id: 'az-activities-5', title: 'Workshop və dərslər', description: 'Kulinariya, keramika və yerli sənət üzrə masterklasslar.' },
      { id: 'az-activities-6', title: 'Ailə macəra parkları', description: 'Zipline, su zonaları və bütün yaşlara uyğun əyləncələr.' },
      { id: 'az-activities-7', title: 'Şəhər veloturları', description: 'Parklar və tarixi küçələr üzrə bələdçili velomarşrutlar.' },
      { id: 'az-activities-8', title: 'Kayak və paddle səfərləri', description: 'Sakit su marşrutları, təhlükəsizlik avadanlığı və təlimatlar.' },
      { id: 'az-activities-9', title: 'Hiking və trekking planları', description: 'Fərqli çətinlikdə cığırlar və yerli bələdçi dəstəyi.' },
      { id: 'az-activities-10', title: 'Kulinariya masterklassları', description: 'Region yeməkləri üzrə praktik dərslər və chef məsləhətləri.' },
      { id: 'az-activities-11', title: 'Yerli rəqs sessiyaları', description: 'Başlanğıc səviyyəsi üçün mədəni rəqs proqramları.' },
      { id: 'az-activities-12', title: 'Canlı musiqi gecələri', description: 'Jazz, akustik və ənənəvi ifa məkanları üzrə seçim.' },
      { id: 'az-activities-13', title: 'Günbatımı qayıq kruizləri', description: 'Liman marşrutu və şəhər silueti ilə axşam proqramı.' },
      { id: 'az-activities-14', title: 'Hava şarı uçuşları', description: 'Səhər uçuşları, panorama mənzərələri və foto dayanacaqları.' },
      { id: 'az-activities-15', title: 'Qış və xizək fəaliyyətləri', description: 'Qar zonaları, avadanlıq icarəsi və qrup dərsləri.' },
      { id: 'az-activities-16', title: 'Çimərlik idman paketləri', description: 'Surf başlanğıcı, voleybol və sahil aktiv oyunları.' },
      { id: 'az-activities-17', title: 'Səhər yoga retreatləri', description: 'Nəfəs məşqləri və sakitlik yönümlü səhər proqramları.' },
      { id: 'az-activities-18', title: 'Foto gəzinti marşrutları', description: 'Kompozisiya və işıqlandırma fokuslu şəhər foto turları.' },
      { id: 'az-activities-19', title: 'Escape room oyunları', description: 'Komanda əsaslı tapmaca otaqları və vaxtlı missiyalar.' },
      { id: 'az-activities-20', title: 'Tema park keçidləri', description: 'Attraksionlar və şoular üçün paket giriş variantları.' },
      { id: 'az-activities-21', title: 'Art studiya sessiyaları', description: 'Rəsm və heykəl üzrə yaradıcı məşğələlər və mentorluq.' },
      { id: 'az-activities-22', title: 'Street food dadım turu', description: 'Yerli küçə yeməyi nöqtələrində bələdçili dadım marşrutu.' },
      { id: 'az-activities-23', title: 'Atla gəzinti səfərləri', description: 'Kənd marşrutları üzrə başlanğıc və təcrübəli səviyyələr.' },
      { id: 'az-activities-24', title: 'Camping və ulduz müşahidəsi', description: 'Gecə düşərgələri, astronomiya nöqtələri və bələdçili proqram.' },
    ],
  },
}

const pagesWithVisualDiscovery = new Set(['attractions', 'activities'])

const discoveryAdviceByLanguage = {
  en: {
    attractions: [
      'Choose the place, pre-book entry when needed, and start early to avoid crowds.',
      'Use a local pass, keep a walking map open, and combine nearby points in one route.',
      'Reserve a guided tour slot, wear comfortable shoes, and plan 2-3 key stops.',
      'Pick photo-friendly hours, check opening times, and keep transport options ready.',
    ],
    activities: [
      'Pick your preferred time slot, confirm meeting point, and review cancellation terms.',
      'Check activity level, required gear, and weather conditions before booking.',
      'Book in advance, arrive 15 minutes early, and keep your confirmation code ready.',
      'Choose based on group type, set duration, and follow safety instructions from guides.',
    ],
  },
  ru: {
    attractions: [
      'Выберите локацию, заранее забронируйте вход и начните маршрут пораньше.',
      'Используйте единый пропуск, откройте карту пешего пути и объедините близкие точки.',
      'Запишитесь на гид-слот, наденьте удобную обувь и оставьте 2-3 главные остановки.',
      'Планируйте визит в лучшее время для фото, учитывайте график и транспорт.',
    ],
    activities: [
      'Выберите удобный слот, подтвердите точку встречи и проверьте условия отмены.',
      'Уточните уровень сложности, необходимое снаряжение и прогноз погоды.',
      'Бронируйте заранее, приходите за 15 минут и держите код подтверждения под рукой.',
      'Подбирайте по составу группы, длительности и следуйте инструкциям по безопасности.',
    ],
  },
  az: {
    attractions: [
      'Məkanı seçin, giriş üçün əvvəlcədən rezerv edin və marşruta erkən başlayın.',
      'Keçid paketindən istifadə edin, piyada xəritəsini açın və yaxın nöqtələri birləşdirin.',
      'Bələdçili tur vaxtını bron edin, rahat ayaqqabı seçin və 2-3 əsas dayanacaq planlayın.',
      'Foto üçün uyğun saatları seçin, açılış vaxtlarını və nəqliyyatı əvvəlcədən yoxlayın.',
    ],
    activities: [
      'Uyğun saat seçin, görüş nöqtəsini təsdiqləyin və ləğv şərtlərinə baxın.',
      'Çətinlik səviyyəsini, lazım olan avadanlığı və hava durumunu yoxlayın.',
      'Öncədən bron edin, 15 dəqiqə əvvəl gəlin və təsdiq kodunu hazır saxlayın.',
      'Qrup tipinə uyğun seçim edin, müddəti müəyyənləşdirin və təhlükəsizlik qaydalarına əməl edin.',
    ],
  },
}

const discoveryInterestsByLanguage = {
  en: {
    attractions: ['History', 'Culture', 'Architecture', 'Photography', 'Family', 'Museums', 'Scenery', 'Local life'],
    activities: ['Adventure', 'Food', 'Wellness', 'Nature', 'Nightlife', 'Learning', 'Family', 'Sports'],
  },
  ru: {
    attractions: ['История', 'Культура', 'Архитектура', 'Фото', 'Семья', 'Музеи', 'Пейзажи', 'Локальная жизнь'],
    activities: ['Приключения', 'Еда', 'Wellness', 'Природа', 'Ночная жизнь', 'Обучение', 'Семья', 'Спорт'],
  },
  az: {
    attractions: ['Tarix', 'Mədəniyyət', 'Memarlıq', 'Foto', 'Ailə', 'Muzey', 'Mənzərə', 'Şəhər həyatı'],
    activities: ['Macəra', 'Yemək', 'Wellness', 'Təbiət', 'Gecə həyatı', 'Öyrənmə', 'Ailə', 'İdman'],
  },
}

const getDiscoveryImageUrl = (section, index) => (
  `https://picsum.photos/seed/traveldesk-${section}-${index + 1}/960/560`
)

const getHashPath = () => window.location.hash.replace('#', '') || '/'

const parseRoomIdFromHash = (hashPath = getHashPath()) => {
  const match = hashPath.match(/^\/rooms\/(\d+)$/)

  if (!match) return null

  const id = Number(match[1])
  return Number.isFinite(id) ? id : null
}

const parseAdminPageFromHash = (hashPath = getHashPath()) => {
  const match = hashPath.match(/^\/admin(?:\/([a-z-]+))?$/)
  if (!match) return null

  const page = match[1] || 'overview'
  return adminPageConfig.some((item) => item.id === page) ? page : 'overview'
}

const parsePublicPageFromHash = (hashPath = getHashPath()) => {
  const match = hashPath.match(/^\/(attractions|activities)$/)
  if (match) return match[1]

  return 'stays'
}

const interpolateText = (template, values = {}) => (
  template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
)

const formatPaymentMethod = (method) => {
  if (!method) return 'Not selected'

  const option = paymentMethodOptions.find((item) => item.value === method)
  return option ? option.label : method
}

const formatStayDate = (value) => {
  if (!value) return ''
  return String(value).split('T')[0]
}

const handlePropertyImageError = (event) => {
  if (event.currentTarget.src.endsWith('/stay-placeholder.svg')) return
  event.currentTarget.src = '/stay-placeholder.svg'
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language') || 'en'
    return languageOptions.some((item) => item.value === savedLanguage) ? savedLanguage : 'en'
  })
  const [user, setUser] = useState(null)
  const [properties, setProperties] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [bookings, setBookings] = useState([])
  const [paymentMethodByBooking, setPaymentMethodByBooking] = useState({})
  const [availability, setAvailability] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [activeRoomId, setActiveRoomId] = useState(() => parseRoomIdFromHash())
  const [adminPage, setAdminPage] = useState(() => parseAdminPageFromHash())
  const [publicPage, setPublicPage] = useState(() => parsePublicPageFromHash())
  const [roomDetails, setRoomDetails] = useState(null)
  const [roomLoading, setRoomLoading] = useState(false)
  const [propertyForm, setPropertyForm] = useState(initialPropertyForm)
  const [propertyImageFile, setPropertyImageFile] = useState(null)
  const [editingPropertyId, setEditingPropertyId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    guests: 2,
    min_price: '',
    max_price: '',
    type: '',
    min_rating: '',
    free_cancellation: 'any',
    breakfast_included: 'any',
    pet_friendly: 'any',
    wifi_included: 'any',
    parking_included: 'any',
    sort: 'rating_desc',
  })
  const [bookingForm, setBookingForm] = useState({
    guest_name: '',
    guest_email: '',
    check_in: '',
    check_out: '',
    guests: 2,
  })

  const apiRequest = useCallback(async (url, options = {}) => {
    const hasFormData = options.body instanceof FormData
    const headers = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(hasFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    })
    const rawBody = await response.text()
    let payload = {}

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody)
      } catch {
        const objectStart = rawBody.indexOf('{')
        const objectEnd = rawBody.lastIndexOf('}')

        if (objectStart !== -1 && objectEnd > objectStart) {
          try {
            payload = JSON.parse(rawBody.slice(objectStart, objectEnd + 1))
          } catch {
            payload = {}
          }
        }
      }
    }

    if (!response.ok) {
      const firstError = payload.message
        || Object.values(payload.errors || {})[0]?.[0]
        || rawBody.slice(0, 180)
      throw new Error(firstError || 'Request failed')
    }

    return payload
  }, [token])

  const t = useCallback(
    (key) => translations[language]?.[key] || translations.en[key] || key,
    [language]
  )

  const tWithValues = useCallback(
    (key, values) => interpolateText(t(key), values),
    [t]
  )

  const formatPropertyType = useCallback((type) => {
    if (type === 'Hotel') return t('option_hotel')
    if (type === 'Airbnb') return t('option_airbnb')
    return type
  }, [t])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      const normalizedValue = String(value).trim()
      if (normalizedValue !== '' && normalizedValue !== 'any') {
        params.set(key, normalizedValue)
      }
    })
    return params.toString()
  }, [filters])

  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => item.property_id)),
    [favorites]
  )

  const activePublicMeta = publicPageMeta[publicPage] || publicPageMeta.stays
  const activePublicCards = publicPageCards[publicPage] || []
  const activeLocalizedPublicCards = localizedPublicCardsByLanguage[language]?.[publicPage]
    || localizedPublicCardsByLanguage.en?.[publicPage]
  const shouldShowDiscoveryMedia = pagesWithVisualDiscovery.has(publicPage)
  const discoveryAdvicePool = discoveryAdviceByLanguage[language]?.[publicPage]
    || discoveryAdviceByLanguage.en?.[publicPage]
    || []
  const discoveryInterestPool = discoveryInterestsByLanguage[language]?.[publicPage]
    || discoveryInterestsByLanguage.en?.[publicPage]
    || []

  useEffect(() => {
    const onHashChange = () => {
      const hashPath = getHashPath()
      setActiveRoomId(parseRoomIdFromHash(hashPath))
      setAdminPage(parseAdminPageFromHash(hashPath))
      setPublicPage(parsePublicPageFromHash(hashPath))
      setSuccess('')
      setError('')
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    const loadMe = async () => {
      try {
        const me = await apiRequest('/api/me')
        setUser(me)
      } catch {
        localStorage.removeItem('token')
        setToken('')
      }
    }

    loadMe()
  }, [token, apiRequest])

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/properties?${queryString}`)
        if (!res.ok) throw new Error('Could not load properties')
        const data = await res.json()
        setProperties(data)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [queryString])

  useEffect(() => {
    if (!activeRoomId) {
      setRoomDetails(null)
      setAvailability([])
      return
    }

    const fetchRoomDetails = async () => {
      setRoomLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/properties/${activeRoomId}`)
        if (!res.ok) throw new Error('Could not load this room.')
        const payload = await res.json()
        setRoomDetails(payload)
        setBookingForm((prev) => ({
          ...prev,
          guests: Math.min(Number(prev.guests) || 1, payload.max_guests),
        }))
      } catch (requestError) {
        setRoomDetails(null)
        setError(requestError.message)
      } finally {
        setRoomLoading(false)
      }
    }

    fetchRoomDetails()
  }, [activeRoomId, apiRequest])

  useEffect(() => {
    if (!roomDetails) {
      setAvailability([])
      return
    }

    const fetchAvailability = async () => {
      setAvailabilityLoading(true)
      try {
        const payload = await apiRequest(`/api/properties/${roomDetails.id}/availability`)
        setAvailability(payload.days || [])
      } catch {
        setAvailability([])
      } finally {
        setAvailabilityLoading(false)
      }
    }

    fetchAvailability()
  }, [roomDetails, apiRequest])

  useEffect(() => {
    if (!user || user.role !== 'guest') return

    const loadUserData = async () => {
      try {
        const [favoritesData, bookingsData] = await Promise.all([
          apiRequest('/api/favorites'),
          apiRequest('/api/bookings'),
        ])

        setFavorites(favoritesData)
        setBookings(bookingsData)
      } catch {
        // keep listing usable even if side panel calls fail
      }
    }

    loadUserData()
  }, [user, apiRequest])

  useEffect(() => {
    if (user?.role === 'guest') {
      setBookingForm((prev) => ({
        ...prev,
        guest_name: prev.guest_name || user.name,
        guest_email: prev.guest_email || user.email,
      }))
    }
  }, [user, apiRequest])

  useEffect(() => {
    if (!bookings.length) return

    setPaymentMethodByBooking((prev) => {
      const next = { ...prev }
      bookings.forEach((booking) => {
        if (!next[booking.id]) {
          next[booking.id] = booking.payment_method || 'credit_card'
        }
      })
      return next
    })
  }, [bookings])

  useEffect(() => {
    if (!user || user.role !== 'admin') return

    const loadAnalytics = async () => {
      try {
        const payload = await apiRequest('/api/admin/analytics')
        setAnalytics(payload)
      } catch {
        setAnalytics(null)
      }
    }

    loadAnalytics()
  }, [user, apiRequest])

  useEffect(() => {
    if (!user) return

    if (user.role !== 'admin' && adminPage) {
      window.location.hash = '/'
    }
  }, [user, adminPage])

  const openRoomDetails = (propertyId) => {
    window.location.hash = `/rooms/${propertyId}`
  }

  const goToPublicPage = (pageId) => {
    const page = publicPageConfig.find((item) => item.id === pageId)
    window.location.hash = page ? page.hash : '/'
  }

  const returnToListing = () => {
    window.location.hash = '/'
  }

  const goToAdminPage = (pageId) => {
    window.location.hash = `/admin/${pageId}`
  }

  const handleBooking = async (event) => {
    event.preventDefault()

    if (!roomDetails) return

    if (!user || user.role !== 'guest') {
      setError('Please login as a guest to reserve this room.')
      return
    }

    setError('')
    setSuccess('')

    try {
      const payload = await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          ...bookingForm,
          guests: Number(bookingForm.guests),
          property_id: roomDetails.id,
        }),
      })

      const propertyTitle =
        payload?.property?.title || roomDetails?.title || 'your selected property'
      const totalPrice = payload?.total_price ?? 'N/A'

      setSuccess(
        `Reservation confirmed for ${propertyTitle}. Total: $${totalPrice}. You can pay in the reservations section.`
      )
      const newBookings = await apiRequest('/api/bookings')
      setBookings(newBookings)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const payBooking = async (bookingId) => {
    setError('')
    setSuccess('')

    try {
      const payload = await apiRequest(`/api/bookings/${bookingId}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          payment_method: paymentMethodByBooking[bookingId] || 'credit_card',
        }),
      })

      setBookings((prev) => prev.map((item) => (item.id === payload.id ? payload : item)))
      setSuccess(`Payment completed for ${payload.property?.title}.`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const endpoint = authMode === 'register' ? '/api/register' : '/api/login'
      const payload = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(authForm),
      })

      const nextToken = payload?.token
        || payload?.data?.token
        || payload?.access_token
        || payload?.data?.access_token
        || null

      if (nextToken) {
        localStorage.setItem('token', nextToken)
        setToken(nextToken)
      } else {

        localStorage.removeItem('token')
        setToken('')
      }

      let nextUser = payload?.user
        || payload?.data?.user
        || payload?.profile
        || payload?.data?.profile
        || null


      if (!nextUser) {
        const meResponse = await fetch('/api/me', {
          credentials: 'include',
          headers: nextToken
            ? {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              Authorization: `Bearer ${nextToken}`,
            }
            : {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
        })

        if (meResponse.ok) {
          nextUser = await meResponse.json()
        }
      }

      if (!nextToken && !nextUser) {
        const debugPreview = JSON.stringify(payload || {}).slice(0, 220)
        throw new Error(
          payload?.message
            || `Login response did not include token or user profile. Payload: ${debugPreview}`
        )
      }


      if (nextUser) {
        setUser(nextUser)
        setSuccess(`Welcome, ${nextUser.name || nextUser.email || 'User'}`)
        if (nextUser.role === 'admin') {
          window.location.hash = '/admin/overview'
        }
      } else {
        setSuccess('Login successful. Loading your profile...')
      }
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleLogout = async () => {
    try {
      await apiRequest('/api/logout', { method: 'POST' })
    } catch {
      // logout should continue even if token already invalid
    }
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
    setFavorites([])
    setBookings([])
    setPaymentMethodByBooking({})
    window.location.hash = '/'
  }

  const toggleFavorite = async (propertyId) => {
    if (!user || user.role !== 'guest') return

    try {
      if (favoriteIds.has(propertyId)) {
        await apiRequest(`/api/favorites/${propertyId}`, { method: 'DELETE' })
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ property_id: propertyId }),
        })
      }
      const updated = await apiRequest('/api/favorites')
      setFavorites(updated)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const startEditProperty = (property) => {
    setEditingPropertyId(property.id)
    setPropertyForm({
      ...property,
    })
  }

  const resetAdminForm = () => {
    setEditingPropertyId(null)
    setPropertyForm(initialPropertyForm)
    setPropertyImageFile(null)
  }

  const submitProperty = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const method = editingPropertyId ? 'PUT' : 'POST'
    const endpoint = editingPropertyId
      ? `/api/properties/${editingPropertyId}`
      : '/api/properties'

    try {
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          ...propertyForm,
          stars: Number(propertyForm.stars),
          rating: Number(propertyForm.rating),
          reviews_count: Number(propertyForm.reviews_count),
          price_per_night: Number(propertyForm.price_per_night),
          max_guests: Number(propertyForm.max_guests),
          room_size_sqm: Number(propertyForm.room_size_sqm),
          free_cancellation: Boolean(propertyForm.free_cancellation),
          breakfast_included: Boolean(propertyForm.breakfast_included),
          pet_friendly: Boolean(propertyForm.pet_friendly),
          wifi_included: Boolean(propertyForm.wifi_included),
          parking_included: Boolean(propertyForm.parking_included),
        }),
      })
      setSuccess(editingPropertyId ? 'Property updated.' : 'Property created.')
      resetAdminForm()
      const refreshed = await apiRequest(`/api/properties?${queryString}`)
      setProperties(refreshed)
      if (user?.role === 'admin') {
        const payload = await apiRequest('/api/admin/analytics')
        setAnalytics(payload)
      }
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const uploadPropertyImage = async () => {
    if (!editingPropertyId || !propertyImageFile) return

    const formData = new FormData()
    formData.append('image', propertyImageFile)

    try {
      await apiRequest(`/api/properties/${editingPropertyId}/image`, {
        method: 'POST',
        body: formData,
      })
      setSuccess('Property image uploaded.')
      const refreshed = await apiRequest(`/api/properties?${queryString}`)
      setProperties(refreshed)
      setPropertyImageFile(null)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const deleteProperty = async (propertyId) => {
    try {
      await apiRequest(`/api/properties/${propertyId}`, { method: 'DELETE' })
      setProperties((prev) => prev.filter((p) => p.id !== propertyId))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const renderSiteNavbar = () => (
    <div className="site-navbar">
      <button type="button" className="site-brand" onClick={() => goToPublicPage('stays')}>
        {t('brand')}
      </button>
      <nav className="site-nav-tabs">
        {publicPageConfig.map((item) => (
          <button
            key={item.id}
            type="button"
            className={publicPage === item.id ? 'active' : ''}
            onClick={() => goToPublicPage(item.id)}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </nav>
      <label className="language-picker">
        <span>{t('language_label')}</span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )

  const renderPublicContentSection = () => {
    if (publicPage === 'stays') {
      return (
        <section className="results">
          {loading && <p>{t('stays_loading')}</p>}
          {!loading && !error && (
            <p className="hint">{tWithValues('stays_available_now', { count: properties.length })}</p>
          )}
          {error && <p className="status error">{error}</p>}
          {!loading && properties.length === 0 && <p>{t('stays_no_match')}</p>}

          {properties.map((property) => (
            <article
              key={property.id}
              className="card"
              onClick={() => openRoomDetails(property.id)}
            >
              <img
                src={property.image_url}
                alt={property.title}
                onError={handlePropertyImageError}
              />
              <div className="card-body">
                <h3>{property.title}</h3>
                <p className="meta">
                  {formatPropertyType(property.type)} - {property.location}
                </p>
                <p>{property.description}</p>
                <div className="row">
                  <span>{'★'.repeat(property.stars)}</span>
                  <strong>${property.price_per_night}/{t('unit_night')}</strong>
                </div>
                <small>
                  {t('room_rating_label')} {property.rating} ({tWithValues('room_reviews', { count: property.reviews_count })})
                </small>
                <div className="amenity-inline">
                  <span>
                    {property.breakfast_included ? t('card_breakfast_included') : t('card_no_breakfast')}
                  </span>
                  <span>
                    {property.pet_friendly ? t('card_pet_friendly') : t('card_no_pets')}
                  </span>
                </div>
                {user?.role === 'guest' && (
                  <button
                    className="favorite-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(property.id)
                    }}
                  >
                    {favoriteIds.has(property.id) ? t('card_remove_favorite') : t('card_add_favorite')}
                  </button>
                )}
                {user?.role === 'admin' && (
                  <div className="admin-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditProperty(property)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProperty(property.id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      )
    }

    return (
      <section className="results">
        <article className="discovery-card discovery-card-featured">
          <h2>{t(activePublicMeta.titleKey)}</h2>
          <p>{t(activePublicMeta.subtitleKey)}</p>
          <small>{t('discovery_hint')}</small>
        </article>
        <div className="discovery-grid">
          {(activeLocalizedPublicCards || activePublicCards).map((card, index) => {
            const howToText = discoveryAdvicePool[index % Math.max(discoveryAdvicePool.length, 1)] || ''
            const interests = discoveryInterestPool.length > 0
              ? [
                discoveryInterestPool[index % discoveryInterestPool.length],
                discoveryInterestPool[(index + 2) % discoveryInterestPool.length],
                discoveryInterestPool[(index + 4) % discoveryInterestPool.length],
              ]
              : []

            return (
            <article key={card.id || card.titleKey} className="discovery-card">
              {shouldShowDiscoveryMedia && (
                <img
                  className="discovery-image"
                  src={getDiscoveryImageUrl(publicPage, index)}
                  alt={card.title || t(card.titleKey)}
                  onError={handlePropertyImageError}
                />
              )}
              <h3>{card.title || t(card.titleKey)}</h3>
              <p>{card.description || t(card.descriptionKey)}</p>
              {shouldShowDiscoveryMedia && (
                <>
                  <p className="discovery-howto">
                    <strong>{t('discovery_how_to_label')}:</strong> {howToText}
                  </p>
                  <div className="discovery-tags">
                    <span className="discovery-tag-label">{t('discovery_best_for_label')}:</span>
                    {interests.map((interest, interestIndex) => (
                      <span key={`${card.id || card.titleKey}-interest-${interestIndex}`} className="discovery-tag">
                        {interest}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </article>
            )
          })}
        </div>
      </section>
    )
  }

  const renderSearchControls = (className = 'search-bar') => (
    <div className={className}>
      <label className="filter-field search-location">
        <span className="filter-hint">{t('filter_location')}</span>
        <input
          placeholder={t('filter_location_placeholder')}
          value={filters.location}
          onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
        />
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_guests')}</span>
        <input
          type="number"
          min="1"
          value={filters.guests}
          onChange={(e) => setFilters((prev) => ({ ...prev, guests: e.target.value }))}
          placeholder={t('filter_guests')}
        />
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_min_price')}</span>
        <input
          type="number"
          min="0"
          value={filters.min_price}
          onChange={(e) => setFilters((prev) => ({ ...prev, min_price: e.target.value }))}
          placeholder="Min $"
        />
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_max_price')}</span>
        <input
          type="number"
          min="0"
          value={filters.max_price}
          onChange={(e) => setFilters((prev) => ({ ...prev, max_price: e.target.value }))}
          placeholder="Max $"
        />
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_type')}</span>
        <select
          value={filters.type}
          onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
        >
          <option value="">{t('option_any')}</option>
          <option value="Hotel">{t('option_hotel')}</option>
          <option value="Airbnb">{t('option_airbnb')}</option>
        </select>
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_rating')}</span>
        <select
          value={filters.min_rating}
          onChange={(e) => setFilters((prev) => ({ ...prev, min_rating: e.target.value }))}
        >
          <option value="">{t('option_any')}</option>
          <option value="9">9.0+</option>
          <option value="8">8.0+</option>
          <option value="7">7.0+</option>
        </select>
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_cancellation')}</span>
        <select
          value={filters.free_cancellation}
          onChange={(e) => setFilters((prev) => ({ ...prev, free_cancellation: e.target.value }))}
        >
          <option value="any">{t('option_any')}</option>
          <option value="1">{t('option_free')}</option>
          <option value="0">{t('option_non_refundable')}</option>
        </select>
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_breakfast')}</span>
        <select
          value={filters.breakfast_included}
          onChange={(e) => setFilters((prev) => ({ ...prev, breakfast_included: e.target.value }))}
        >
          <option value="any">{t('option_any')}</option>
          <option value="1">{t('option_included')}</option>
          <option value="0">{t('option_not_included')}</option>
        </select>
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_pets')}</span>
        <select
          value={filters.pet_friendly}
          onChange={(e) => setFilters((prev) => ({ ...prev, pet_friendly: e.target.value }))}
        >
          <option value="any">{t('option_any')}</option>
          <option value="1">{t('option_allowed')}</option>
          <option value="0">{t('option_not_allowed')}</option>
        </select>
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_wifi')}</span>
        <select
          value={filters.wifi_included}
          onChange={(e) => setFilters((prev) => ({ ...prev, wifi_included: e.target.value }))}
        >
          <option value="any">{t('option_any')}</option>
          <option value="1">{t('option_included')}</option>
          <option value="0">{t('option_not_included')}</option>
        </select>
      </label>

      <label className="filter-field">
        <span className="filter-hint">{t('filter_parking')}</span>
        <select
          value={filters.parking_included}
          onChange={(e) => setFilters((prev) => ({ ...prev, parking_included: e.target.value }))}
        >
          <option value="any">{t('option_any')}</option>
          <option value="1">{t('option_included')}</option>
          <option value="0">{t('option_not_included')}</option>
        </select>
      </label>

      <label className="filter-field search-sort">
        <span className="filter-hint">{t('filter_order')}</span>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
        >
          <option value="rating_desc">{t('option_top_rated')}</option>
          <option value="most_booked">{t('option_most_booked')}</option>
          <option value="price_asc">{t('option_price_low_high')}</option>
          <option value="price_desc">{t('option_price_high_low')}</option>
          <option value="rating_asc">{t('option_rating_low_high')}</option>
        </select>
      </label>
    </div>
  )

  const renderAuthForm = () => (
    <>
      <h2>{t('auth_title')}</h2>
      <form onSubmit={handleAuthSubmit} className="booking-form">
        {authMode === 'register' && (
          <input
            required
            placeholder={t('auth_name_placeholder')}
            value={authForm.name}
            onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        )}
        <input
          required
          type="email"
          placeholder={t('auth_email_placeholder')}
          value={authForm.email}
          onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          required
          type="password"
          placeholder={t('auth_password_placeholder')}
          value={authForm.password}
          onChange={(e) =>
            setAuthForm((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <button type="submit">
          {authMode === 'register' ? t('auth_create_guest') : t('auth_login')}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))}
        >
          {authMode === 'login' ? t('auth_switch_to_register') : t('auth_switch_to_login')}
        </button>
      </form>
      <p className="hint">{t('auth_admin_hint')}</p>
    </>
  )

  const renderReservationPanel = () => (
    <section className="reservation-panel">
      <h3>My reservations and payments</h3>
      {bookings.length === 0 && <p className="hint">No reservations yet.</p>}
      {bookings.length > 0 && (
        <ul className="reservation-list">
          {bookings.map((item) => {
            const isPaid = item.payment_status === 'paid'

            return (
              <li key={item.id} className="reservation-item">
                <div className="reservation-head">
                  <strong>{item.property?.title}</strong>
                  <span className={`payment-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <small>
                  {formatStayDate(item.check_in)} to {formatStayDate(item.check_out)} • ${item.total_price}
                </small>
                {isPaid ? (
                  <small>
                    {formatPaymentMethod(item.payment_method)}
                    {item.paid_at ? ` • Paid at ${new Date(item.paid_at).toLocaleDateString()}` : ''}
                  </small>
                ) : (
                  <div className="pay-controls">
                    <select
                      value={paymentMethodByBooking[item.id] || 'credit_card'}
                      onChange={(e) =>
                        setPaymentMethodByBooking((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                    >
                      {paymentMethodOptions.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => payBooking(item.id)}
                    >
                      Pay now
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )

  const renderFavoritesPanel = () => (
    <>
      <h3>Your favorites</h3>
      <ul className="compact-list">
        {favorites.map((item) => (
          <li key={item.id}>{item.property?.title}</li>
        ))}
      </ul>
    </>
  )

  const renderAdminNavigation = () => (
    <nav className="admin-nav">
      {adminPageConfig.map((page) => (
        <button
          key={page.id}
          type="button"
          className={adminPage === page.id ? 'active' : ''}
          onClick={() => goToAdminPage(page.id)}
        >
          {page.label}
        </button>
      ))}
      <button type="button" onClick={returnToListing}>
        Public listing
      </button>
    </nav>
  )

  const renderAdminOverviewPage = () => (
    <section className="admin-page">
      <h2>Admin overview</h2>
      {!analytics && <p>Loading analytics...</p>}
      {analytics && (
        <>
          <div className="admin-kpis admin-kpis-wide">
            <p>Properties: {analytics.total_properties}</p>
            <p>Bookings: {analytics.total_bookings}</p>
            <p>Revenue: ${analytics.confirmed_revenue}</p>
            <p>Active guests: {analytics.active_guests}</p>
          </div>
          <h3>Top booked properties</h3>
          <ul className="compact-list">
            {analytics.top_properties?.map((item) => (
              <li key={item.id}>
                {item.title} ({item.bookings_count} bookings)
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )

  const renderAdminPropertiesPage = () => (
    <section className="admin-page">
      <div className="admin-page-header">
        <h2>Manage properties</h2>
        <button type="button" onClick={() => {
          resetAdminForm()
          goToAdminPage('editor')
        }}
        >
          Create new room
        </button>
      </div>
      {renderSearchControls('search-bar admin-search-bar')}
      <div className="results admin-results">
        {properties.map((property) => (
          <article
            key={property.id}
            className="card"
            onClick={() => openRoomDetails(property.id)}
          >
            <img
              src={property.image_url}
              alt={property.title}
              onError={handlePropertyImageError}
            />
            <div className="card-body">
              <h3>{property.title}</h3>
              <p className="meta">
                {formatPropertyType(property.type)} - {property.location}
              </p>
              <p>{property.description}</p>
              <div className="row">
                <span>{'★'.repeat(property.stars)}</span>
                <strong>${property.price_per_night}/{t('unit_night')}</strong>
              </div>
              <small>
                {t('room_rating_label')} {property.rating} ({tWithValues('room_reviews', { count: property.reviews_count })})
              </small>
              <div className="admin-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startEditProperty(property)
                    goToAdminPage('editor')
                  }}
                >
                  Edit
                </button>
                <button
                  className="danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteProperty(property.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )

  const renderAdminEditorPage = () => (
    <section className="admin-page">
      <h2>{editingPropertyId ? 'Update room' : 'Create room'}</h2>
      <form onSubmit={submitProperty} className="booking-form admin-form">
        <input
          required
          placeholder="Title"
          value={propertyForm.title}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, title: e.target.value }))}
        />
        <input
          required
          placeholder="Location"
          value={propertyForm.location}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, location: e.target.value }))
          }
        />
        <select
          value={propertyForm.type}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, type: e.target.value }))}
        >
          <option value="Hotel">Hotel</option>
          <option value="Airbnb">Airbnb</option>
        </select>
        <input
          required
          placeholder="Image URL"
          value={propertyForm.image_url}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, image_url: e.target.value }))
          }
        />
        <textarea
          required
          placeholder="Description"
          value={propertyForm.description}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <input
          type="number"
          min="1"
          max="5"
          value={propertyForm.stars}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, stars: e.target.value }))}
          placeholder="Stars"
        />
        <input
          type="number"
          min="1"
          max="10"
          step="0.1"
          value={propertyForm.rating}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, rating: e.target.value }))}
          placeholder="Rating"
        />
        <input
          type="number"
          min="0"
          value={propertyForm.reviews_count}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, reviews_count: e.target.value }))
          }
          placeholder="Reviews count"
        />
        <input
          type="number"
          min="1"
          value={propertyForm.price_per_night}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, price_per_night: e.target.value }))
          }
          placeholder="Price per night"
        />
        <input
          type="number"
          min="1"
          value={propertyForm.max_guests}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, max_guests: e.target.value }))
          }
          placeholder="Max guests"
        />
        <input
          type="number"
          min="10"
          max="250"
          value={propertyForm.room_size_sqm}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, room_size_sqm: e.target.value }))
          }
          placeholder="Room size (sqm)"
        />
        <input
          value={propertyForm.bed_type}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, bed_type: e.target.value }))}
          placeholder="Bed type"
        />
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.free_cancellation)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, free_cancellation: e.target.checked }))
            }
          />
          Free cancellation
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.breakfast_included)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, breakfast_included: e.target.checked }))
            }
          />
          Breakfast included
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.pet_friendly)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, pet_friendly: e.target.checked }))
            }
          />
          Pet friendly
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.wifi_included)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, wifi_included: e.target.checked }))
            }
          />
          Wi-Fi included
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.parking_included)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, parking_included: e.target.checked }))
            }
          />
          Parking included
        </label>
        <button type="submit">{editingPropertyId ? 'Update room' : 'Create room'}</button>
        {editingPropertyId && (
          <button type="button" className="secondary" onClick={resetAdminForm}>
            Cancel edit
          </button>
        )}
      </form>
      {editingPropertyId && (
        <div className="booking-form admin-form">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPropertyImageFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            className="secondary"
            onClick={uploadPropertyImage}
            disabled={!propertyImageFile}
          >
            Upload selected image
          </button>
        </div>
      )}
    </section>
  )

  const renderAdminPortalPage = () => (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          {renderSiteNavbar()}
          <p className="eyebrow">Admin workspace</p>
          <h1>Admin panel</h1>
          <p className="subtitle">
            Use navigation tabs to view analytics, manage properties, and edit room details.
          </p>
          <div className="top-actions">
            <span>
              {tWithValues('signed_in_as', { name: user?.name || '-', role: user?.role || '-' })}
            </span>
            <button onClick={handleLogout}>{t('logout')}</button>
          </div>
          {renderAdminNavigation()}
        </div>
      </header>

      <main className="admin-layout">
        {adminPage === 'overview' && renderAdminOverviewPage()}
        {adminPage === 'properties' && renderAdminPropertiesPage()}
        {adminPage === 'editor' && renderAdminEditorPage()}
        {renderGlobalStatus()}
      </main>
    </div>
  )

  const renderGlobalStatus = () => (
    <>
      {success && <p className="status success">{success}</p>}
      {error && <p className="status error">{error}</p>}
    </>
  )

  const renderGuestDashboard = () => (
    <>
      <h2>Your travel dashboard</h2>
      <p className="hint">Open any room to book. Your reservations and payments appear here.</p>
      {renderFavoritesPanel()}
      {renderReservationPanel()}
    </>
  )

  const renderRoomDetailsPage = () => {
    const yesNo = (value, yesLabel, noLabel) => (value ? yesLabel : noLabel)

    return (
      <div className="page">
        <header className="hero">
          <div className="hero-content">
            {renderSiteNavbar()}
            <div className="room-top-row">
              <button type="button" className="back-button" onClick={returnToListing}>
                {t('back_to_stays')}
              </button>
              <div className="top-actions">
                {!user ? (
                  <span>{t('room_preview_tip')}</span>
                ) : (
                  <span>
                    {tWithValues('signed_in_as', { name: user.name, role: user.role })}
                  </span>
                )}
                {user && <button onClick={handleLogout}>{t('logout')}</button>}
              </div>
            </div>
            <h1>{t('room_details_title')}</h1>
          </div>
        </header>

        <main className="layout room-layout">
          <section className="results">
            {roomLoading && <p>{t('room_loading')}</p>}
            {!roomLoading && !roomDetails && <p>{t('room_not_found')}</p>}

            {roomDetails && (
              <article className="room-detail-card">
                <img
                  src={roomDetails.image_url}
                  alt={roomDetails.title}
                  onError={handlePropertyImageError}
                />
                <div className="room-detail-content">
                  <h2>{roomDetails.title}</h2>
                  <p className="meta">
                    {formatPropertyType(roomDetails.type)} - {roomDetails.location}
                  </p>
                  <p>{roomDetails.description}</p>

                  <div className="room-spec-grid">
                    <div>
                      <strong>{t('room_price_label')}:</strong> ${roomDetails.price_per_night} / {t('unit_night')}
                    </div>
                    <div>
                      <strong>{t('room_guests_label')}:</strong> {tWithValues('room_up_to', { count: roomDetails.max_guests })}
                    </div>
                    <div>
                      <strong>{t('room_rating_label')}:</strong> {roomDetails.rating} ({tWithValues('room_reviews', { count: roomDetails.reviews_count })})
                    </div>
                    <div>
                      <strong>{t('room_size_label')}:</strong> {roomDetails.room_size_sqm} {t('unit_sqm')}
                    </div>
                    <div>
                      <strong>{t('room_bed_type_label')}:</strong> {roomDetails.bed_type}
                    </div>
                    <div>
                      <strong>{t('room_stars_label')}:</strong> {'★'.repeat(roomDetails.stars)}
                    </div>
                  </div>

                  <h3>{t('room_features_title')}</h3>
                  <div className="amenity-grid">
                    <span>{yesNo(roomDetails.breakfast_included, t('room_breakfast_included'), t('room_breakfast_not_included'))}</span>
                    <span>{yesNo(roomDetails.pet_friendly, t('room_pet_friendly'), t('room_not_pet_friendly'))}</span>
                    <span>{yesNo(roomDetails.wifi_included, t('room_wifi_included'), t('room_wifi_not_included'))}</span>
                    <span>{yesNo(roomDetails.parking_included, t('room_parking_included'), t('room_no_parking'))}</span>
                    <span>{yesNo(roomDetails.free_cancellation, t('room_free_cancellation'), t('room_non_refundable'))}</span>
                  </div>
                </div>
              </article>
            )}

            {roomDetails && (
              <section className="availability-block">
                <h3>{t('availability_30_days')}</h3>
                {availabilityLoading ? (
                  <p>{t('availability_loading')}</p>
                ) : (
                  <div className="availability-grid">
                    {availability.map((day) => (
                      <span
                        key={day.date}
                        className={`day-pill ${day.available ? 'free' : 'booked'}`}
                        title={day.date}
                      >
                        {day.date.slice(5)}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}
          </section>

          <aside className="sidebar">
            {!user && renderAuthForm()}

            {user?.role === 'guest' && (
              <>
                <h2>{t('reserve_room_title')}</h2>
                {!roomDetails && <p>{t('reserve_select_room')}</p>}

                {roomDetails && (
                  <>
                    <div className="selected">
                      <strong>{roomDetails.title}</strong>
                      <p>
                        {tWithValues('reserve_summary', { location: roomDetails.location, guests: roomDetails.max_guests })}
                      </p>
                    </div>

                    <form onSubmit={handleBooking} className="booking-form">
                      <input
                        required
                        placeholder={t('booking_full_name')}
                        value={bookingForm.guest_name}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, guest_name: e.target.value }))
                        }
                      />
                      <input
                        required
                        type="email"
                        placeholder={t('auth_email_placeholder')}
                        value={bookingForm.guest_email}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, guest_email: e.target.value }))
                        }
                      />
                      <label>
                        {t('booking_check_in')}
                        <input
                          required
                          type="date"
                          value={bookingForm.check_in}
                          onChange={(e) =>
                            setBookingForm((prev) => ({ ...prev, check_in: e.target.value }))
                          }
                        />
                      </label>
                      <label>
                        {t('booking_check_out')}
                        <input
                          required
                          type="date"
                          value={bookingForm.check_out}
                          onChange={(e) =>
                            setBookingForm((prev) => ({ ...prev, check_out: e.target.value }))
                          }
                        />
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        max={roomDetails.max_guests}
                        value={bookingForm.guests}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, guests: e.target.value }))
                        }
                      />
                      <button type="submit">{t('booking_submit')}</button>
                    </form>
                  </>
                )}

                {renderFavoritesPanel()}
                {renderReservationPanel()}
              </>
            )}

            {user?.role === 'admin' && (
              <section className="admin-sidebar-note">
                <h2>Admin navigation</h2>
                <p>Admin tools were moved to dedicated pages in the top navigation bar.</p>
                <button type="button" onClick={() => goToAdminPage('overview')}>
                  Open admin panel
                </button>
              </section>
            )}
            {renderGlobalStatus()}
          </aside>
        </main>
      </div>
    )
  }

  if (adminPage && user?.role === 'admin') {
    return renderAdminPortalPage()
  }

  if (activeRoomId) {
    return renderRoomDetailsPage()
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          {renderSiteNavbar()}
          <p className="eyebrow">{t('hero_eyebrow')}</p>
          <h1>{t(activePublicMeta.titleKey)}</h1>
          <p className="subtitle">{t(activePublicMeta.subtitleKey)}</p>
          <div className="top-actions">
            {!user ? (
              <span>{t('hero_guest_tip')}</span>
            ) : (
              <span>
                {tWithValues('signed_in_as', { name: user.name, role: user.role })}
              </span>
            )}
            {user && <button onClick={handleLogout}>{t('logout')}</button>}
          </div>

          {publicPage === 'stays' && renderSearchControls()}
        </div>
      </header>

      <main className="layout">
        {renderPublicContentSection()}

        <aside className="sidebar">
          {!user && renderAuthForm()}
          {user?.role === 'guest' && renderGuestDashboard()}
          {user?.role === 'admin' && (
            <section className="admin-sidebar-note">
              <h2>Admin navigation</h2>
              <p>Use the dedicated admin pages from the top navigation bar.</p>
              <button type="button" onClick={() => goToAdminPage('overview')}>
                Open admin panel
              </button>
            </section>
          )}
          {renderGlobalStatus()}
        </aside>
      </main>
    </div>
  )
}

export default App
