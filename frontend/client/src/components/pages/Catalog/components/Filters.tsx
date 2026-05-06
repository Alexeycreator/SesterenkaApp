import React from 'react';
import { Card, Button, InputGroup, Form, Accordion } from 'react-bootstrap';

import styles from '../CatalogPage.module.css';

interface FilterState {
    brands: string[];
    minPrice: number;
    maxPrice: number;
}

interface FiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onClearSearch: () => void;
    availableBrands: string[];
    filters: FilterState;
    onBrandChange: (brand: string) => void;
    tempMinPrice: number;
    tempMaxPrice: number;
    onTempMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTempMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onApplyPriceFilter: () => void;
    priceRange: { min: number; max: number };
    onResetFilters: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
    searchQuery,
    onSearchChange,
    onSearch,
    onClearSearch,
    availableBrands,
    filters,
    onBrandChange,
    tempMinPrice,
    tempMaxPrice,
    onTempMinPriceChange,
    onTempMaxPriceChange,
    onApplyPriceFilter,
    priceRange,
    onResetFilters
}) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <Card className={styles.filtersCard}>
            <Card.Body>
                <h3 className={styles.filtersTitle}>Фильтры</h3>

                {/* Поиск */}
                <div className="mb-4">
                    <InputGroup>
                        <Form.Control
                            placeholder="Поиск по названию или артикулу..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <Button
                                variant="outline-secondary"
                                onClick={onClearSearch}
                                className={styles.clearButton}
                            >
                                ✕
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={onSearch}
                            className={styles.searchButton}
                        >
                            🔍
                        </Button>
                    </InputGroup>
                </div>

                <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
                    {/* Фильтр по брендам */}
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Бренды</Accordion.Header>
                        <Accordion.Body>
                            {availableBrands.length === 0 ? (
                                <p className="text-muted">Нет доступных брендов</p>
                            ) : (
                                availableBrands.map((brand) => {
                                    const brandString = brand?.toString() ?? '';
                                    if (!brandString) return null;
                                    return (
                                        <Form.Check
                                            key={brandString}
                                            type="checkbox"
                                            id={`brand-${brandString}`}
                                            label={brandString}
                                            checked={filters.brands.includes(brandString)}
                                            onChange={() => onBrandChange(brandString)}
                                            className={styles.filterCheckbox}
                                        />
                                    );
                                })
                            )}
                        </Accordion.Body>
                    </Accordion.Item>

                    {/* Фильтр по цене */}
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Цена</Accordion.Header>
                        <Accordion.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>От</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={tempMinPrice === 0 ? '' : tempMinPrice}
                                    onChange={onTempMinPriceChange}
                                    placeholder={`${priceRange.min}`}
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    className={styles.priceInput}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>До</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={tempMaxPrice === 10000 ? '' : tempMaxPrice}
                                    onChange={onTempMaxPriceChange}
                                    placeholder={`${priceRange.max}`}
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    className={styles.priceInput}
                                />
                            </Form.Group>
                            <Button
                                variant="primary"
                                onClick={onApplyPriceFilter}
                                className={styles.applyPriceButton}
                                size="sm"
                            >
                                Применить
                            </Button>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

                <Button
                    variant="outline-secondary"
                    onClick={onResetFilters}
                    className={styles.resetFiltersButton}
                    size="sm"
                >
                    Сбросить фильтры
                </Button>
            </Card.Body>
        </Card>
    );
};