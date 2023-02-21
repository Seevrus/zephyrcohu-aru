-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2023. Feb 21. 23:59
-- Kiszolgáló verziója: 10.4.27-MariaDB
-- PHP verzió: 8.0.25

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `zephyrco_aru`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `agents`
--

DROP TABLE IF EXISTS `agents`;
CREATE TABLE `agents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(2) NOT NULL,
  `name` varchar(50) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_active` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `companies`
--

DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(3) NOT NULL,
  `name` varchar(50) NOT NULL,
  `country` varchar(2) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `city` varchar(30) NOT NULL,
  `address` varchar(40) NOT NULL,
  `felir` varchar(9) NOT NULL,
  `vat_number` varchar(13) NOT NULL,
  `iban` varchar(4) NOT NULL,
  `bank_account` varchar(26) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(70) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `expirations`
--

DROP TABLE IF EXISTS `expirations`;
CREATE TABLE `expirations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `expires_at` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `expiration_store`
--

DROP TABLE IF EXISTS `expiration_store`;
CREATE TABLE `expiration_store` (
  `expiration_id` bigint(20) UNSIGNED NOT NULL,
  `store_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` smallint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `items`
--

DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `cn_code` varchar(6) NOT NULL,
  `article_number` varchar(16) NOT NULL,
  `name` varchar(60) NOT NULL,
  `short_name` varchar(10) NOT NULL,
  `category` varchar(20) NOT NULL,
  `unit_name` varchar(6) NOT NULL,
  `product_catalog_code` varchar(11) NOT NULL,
  `vat_rate` varchar(2) NOT NULL,
  `net_price` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `logs`
--

DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(255) NOT NULL,
  `occured_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `order_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `article_number` varchar(16) NOT NULL,
  `quantity` smallint(5) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `partners`
--

DROP TABLE IF EXISTS `partners`;
CREATE TABLE `partners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(6) NOT NULL,
  `site_code` varchar(4) NOT NULL,
  `vat_number` varchar(13) NOT NULL,
  `invoice_type` varchar(1) NOT NULL,
  `invoice_copies` tinyint(3) UNSIGNED NOT NULL,
  `payment_days` tinyint(3) UNSIGNED NOT NULL,
  `iban` varchar(4) NOT NULL,
  `bank_account` varchar(26) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(70) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `partner_lists`
--

DROP TABLE IF EXISTS `partner_lists`;
CREATE TABLE `partner_lists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `partner_locations`
--

DROP TABLE IF EXISTS `partner_locations`;
CREATE TABLE `partner_locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `partner_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `location_type` varchar(1) NOT NULL,
  `country` varchar(2) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `city` varchar(30) NOT NULL,
  `address` varchar(40) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `partner_partner_list`
--

DROP TABLE IF EXISTS `partner_partner_list`;
CREATE TABLE `partner_partner_list` (
  `partner_id` bigint(20) UNSIGNED NOT NULL,
  `partner_list_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `price_lists`
--

DROP TABLE IF EXISTS `price_lists`;
CREATE TABLE `price_lists` (
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `partner_id` bigint(20) UNSIGNED NOT NULL,
  `net_price` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `receipts`
--

DROP TABLE IF EXISTS `receipts`;
CREATE TABLE `receipts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `company_code` varchar(3) NOT NULL,
  `partner_code` varchar(6) NOT NULL,
  `partner_site_code` varchar(4) NOT NULL,
  `ci_serial_number` mediumint(8) UNSIGNED DEFAULT NULL,
  `ci_year_code` smallint(5) UNSIGNED DEFAULT NULL,
  `serial_number` mediumint(8) UNSIGNED NOT NULL,
  `year_code` smallint(5) UNSIGNED NOT NULL,
  `original_copies_printed` tinyint(3) UNSIGNED NOT NULL,
  `vendor_name` varchar(50) NOT NULL,
  `vendor_country` varchar(2) NOT NULL,
  `vendor_postal_code` varchar(10) NOT NULL,
  `vendor_city` varchar(30) NOT NULL,
  `vendor_address` varchar(40) NOT NULL,
  `vendor_felir` varchar(9) NOT NULL,
  `vendor_iban` varchar(4) DEFAULT NULL,
  `vendor_bank_account` varchar(26) DEFAULT NULL,
  `vendor_vat_number` varchar(13) NOT NULL,
  `buyer_name` varchar(50) NOT NULL,
  `buyer_country` varchar(2) NOT NULL,
  `buyer_postal_code` varchar(10) NOT NULL,
  `buyer_city` varchar(30) NOT NULL,
  `buyer_address` varchar(40) NOT NULL,
  `buyer_iban` varchar(4) DEFAULT NULL,
  `buyer_bank_account` varchar(26) DEFAULT NULL,
  `buyer_vat_number` varchar(13) NOT NULL,
  `buyer_delivery_name` varchar(50) DEFAULT NULL,
  `buyer_delvery_country` varchar(2) DEFAULT NULL,
  `buyer_delivery_postal_code` varchar(10) DEFAULT NULL,
  `buyer_delivery_city` varchar(30) DEFAULT NULL,
  `buyer_delivery_address` varchar(40) DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `fulfillment_date` date NOT NULL,
  `invoice_type` varchar(1) NOT NULL,
  `paid_date` date NOT NULL,
  `agent_code` varchar(2) NOT NULL,
  `agent_name` varchar(50) NOT NULL,
  `agent_phone_number` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `net_amount` int(11) NOT NULL,
  `vat_amount` int(11) DEFAULT NULL,
  `gross_amount` int(11) NOT NULL,
  `round_amount` tinyint(4) NOT NULL,
  `rounded_amount` int(11) NOT NULL,
  `last_downloaded_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `receipt_items`
--

DROP TABLE IF EXISTS `receipt_items`;
CREATE TABLE `receipt_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `receipt_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(3) NOT NULL,
  `cn_code` varchar(6) NOT NULL,
  `article_number` varchar(16) NOT NULL,
  `expires_at` date NOT NULL,
  `name` varchar(60) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_name` varchar(6) NOT NULL,
  `net_price` int(11) NOT NULL,
  `net_amount` int(11) NOT NULL,
  `vat_rate` varchar(2) NOT NULL,
  `vat_amount` int(11) DEFAULT NULL,
  `gross_amount` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `stores`
--

DROP TABLE IF EXISTS `stores`;
CREATE TABLE `stores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(4) NOT NULL,
  `name` varchar(255) NOT NULL,
  `first_available_serial_number` mediumint(8) UNSIGNED NOT NULL,
  `last_available_serial_number` mediumint(8) UNSIGNED NOT NULL,
  `year_code` smallint(5) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `type` varchar(1) NOT NULL,
  `device_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_active` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `vat_amounts`
--

DROP TABLE IF EXISTS `vat_amounts`;
CREATE TABLE `vat_amounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `receipt_id` bigint(20) UNSIGNED NOT NULL,
  `vat_rate` varchar(2) NOT NULL,
  `net_amount` int(11) NOT NULL,
  `vat_amount` int(11) NOT NULL,
  `gross_amount` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `agents`
--
ALTER TABLE `agents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `agents_code_unique` (`code`),
  ADD KEY `agents_company_id_foreign` (`company_id`);

--
-- A tábla indexei `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `companies_code_unique` (`code`);

--
-- A tábla indexei `expirations`
--
ALTER TABLE `expirations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expirations_item_id_foreign` (`item_id`);

--
-- A tábla indexei `expiration_store`
--
ALTER TABLE `expiration_store`
  ADD KEY `expiration_store_expiration_id_foreign` (`expiration_id`),
  ADD KEY `expiration_store_store_id_foreign` (`store_id`);

--
-- A tábla indexei `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `items_article_number_unique` (`article_number`),
  ADD KEY `items_company_id_foreign` (`company_id`);

--
-- A tábla indexei `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `logs_company_id_foreign` (`company_id`),
  ADD KEY `logs_user_id_foreign` (`user_id`);

--
-- A tábla indexei `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_company_id_foreign` (`company_id`);

--
-- A tábla indexei `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`);

--
-- A tábla indexei `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `partners_code_site_code_unique` (`code`,`site_code`),
  ADD KEY `partners_company_id_foreign` (`company_id`);

--
-- A tábla indexei `partner_lists`
--
ALTER TABLE `partner_lists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `partner_lists_company_id_foreign` (`company_id`);

--
-- A tábla indexei `partner_locations`
--
ALTER TABLE `partner_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `partner_locations_partner_id_foreign` (`partner_id`);

--
-- A tábla indexei `partner_partner_list`
--
ALTER TABLE `partner_partner_list`
  ADD KEY `partner_partner_list_partner_id_foreign` (`partner_id`),
  ADD KEY `partner_partner_list_partner_list_id_foreign` (`partner_list_id`);

--
-- A tábla indexei `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_tokenable_id_foreign` (`tokenable_id`);

--
-- A tábla indexei `price_lists`
--
ALTER TABLE `price_lists`
  ADD KEY `price_lists_item_id_foreign` (`item_id`),
  ADD KEY `price_lists_partner_id_foreign` (`partner_id`);

--
-- A tábla indexei `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receipts_company_id_foreign` (`company_id`);

--
-- A tábla indexei `receipt_items`
--
ALTER TABLE `receipt_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receipt_items_receipt_id_foreign` (`receipt_id`);

--
-- A tábla indexei `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `stores_code_unique` (`code`),
  ADD KEY `stores_company_id_foreign` (`company_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_company_id_phone_number_type_unique` (`company_id`,`phone_number`,`type`);

--
-- A tábla indexei `vat_amounts`
--
ALTER TABLE `vat_amounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vat_amounts_receipt_id_foreign` (`receipt_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `agents`
--
ALTER TABLE `agents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `expirations`
--
ALTER TABLE `expirations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `items`
--
ALTER TABLE `items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `logs`
--
ALTER TABLE `logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `partners`
--
ALTER TABLE `partners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `partner_lists`
--
ALTER TABLE `partner_lists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `partner_locations`
--
ALTER TABLE `partner_locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `receipt_items`
--
ALTER TABLE `receipt_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `stores`
--
ALTER TABLE `stores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `vat_amounts`
--
ALTER TABLE `vat_amounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `agents`
--
ALTER TABLE `agents`
  ADD CONSTRAINT `agents_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `expirations`
--
ALTER TABLE `expirations`
  ADD CONSTRAINT `expirations_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `expiration_store`
--
ALTER TABLE `expiration_store`
  ADD CONSTRAINT `expiration_store_expiration_id_foreign` FOREIGN KEY (`expiration_id`) REFERENCES `expirations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expiration_store_store_id_foreign` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `partners`
--
ALTER TABLE `partners`
  ADD CONSTRAINT `partners_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `partner_lists`
--
ALTER TABLE `partner_lists`
  ADD CONSTRAINT `partner_lists_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `partner_locations`
--
ALTER TABLE `partner_locations`
  ADD CONSTRAINT `partner_locations_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `partner_partner_list`
--
ALTER TABLE `partner_partner_list`
  ADD CONSTRAINT `partner_partner_list_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `partner_partner_list_partner_list_id_foreign` FOREIGN KEY (`partner_list_id`) REFERENCES `partner_lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD CONSTRAINT `personal_access_tokens_tokenable_id_foreign` FOREIGN KEY (`tokenable_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `price_lists`
--
ALTER TABLE `price_lists`
  ADD CONSTRAINT `price_lists_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `price_lists_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `receipt_items`
--
ALTER TABLE `receipt_items`
  ADD CONSTRAINT `receipt_items_receipt_id_foreign` FOREIGN KEY (`receipt_id`) REFERENCES `receipts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Megkötések a táblához `vat_amounts`
--
ALTER TABLE `vat_amounts`
  ADD CONSTRAINT `vat_amounts_receipt_id_foreign` FOREIGN KEY (`receipt_id`) REFERENCES `receipts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
