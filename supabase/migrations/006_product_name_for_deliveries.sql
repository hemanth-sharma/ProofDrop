-- Migration: 006_product_name_for_deliveries.sql

ALTER TABLE deliveries
ADD COLUMN product_name text;