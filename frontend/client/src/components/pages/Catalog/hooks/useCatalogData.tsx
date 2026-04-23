import { useState, useEffect, useCallback } from 'react';
import { getCatalogData, Catalog } from '../../../servicesApi/CatalogApi';
import { Categories } from '../../../servicesApi/CategoriesApi';
import { Product } from '../../../servicesApi/ProductsApi';
import { Manufacturer } from '../../../servicesApi/ManufacturersApi';
import { StockWarehousesQuantity } from '../../../servicesApi/StocksApi';

interface UseCatalogDataReturn {
    // Данные
    catalogData: Catalog | null;
    categoriesData: Categories[];
    productData: Product[];
    manufacturerData: Manufacturer[];
    stockWarehousesQuantityData: StockWarehousesQuantity[];

    // Состояния загрузки
    loading: boolean;
    error: string | null;

    // Методы
    fetchCatalogData: () => Promise<void>;
    refreshData: () => Promise<void>;
    clearData: () => void;
}

export const useCatalogData = (): UseCatalogDataReturn => {
    const [catalogData, setCatalogData] = useState<Catalog | null>(null);
    const [categoriesData, setCategoriesData] = useState<Categories[]>([]);
    const [productData, setProductData] = useState<Product[]>([]);
    const [manufacturerData, setManufacturerData] = useState<Manufacturer[]>([]);
    const [stockWarehousesQuantityData, setStockWarehousesQuantityData] = useState<StockWarehousesQuantity[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Извлечение данных из объекта Catalog
    const extractDataFromCatalog = useCallback((data: Catalog) => {
        setCategoriesData(data.categories || []);
        setProductData(data.products || []);
        setStockWarehousesQuantityData(data.stocks || []);
        setManufacturerData(data.manufacturers || []);
    }, []);

    // Очистка всех данных
    const clearData = useCallback(() => {
        setCatalogData(null);
        setCategoriesData([]);
        setProductData([]);
        setManufacturerData([]);
        setStockWarehousesQuantityData([]);
        setError(null);
    }, []);

    // Загрузка данных каталога
    const fetchCatalogData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getCatalogData();
            setCatalogData(data);

            if (data) {
                extractDataFromCatalog(data);
            } else {
                console.log('Данные для страницы каталога пустые!');
                clearData();
            }
        } catch (err: any) {
            console.error('Ошибка загрузки страницы каталога:', err);

            if (err.code === 'ERR_BAD_REQUEST') {
                if (err.response?.status === 404) {
                    setError(err.response.data?.message || 'Информация не найдена');
                } else {
                    setError(err.response?.data?.message || 'Ошибка загрузки данных');
                }
            } else {
                setError('Ошибка соединения с сервером');
            }

            clearData();
        } finally {
            setLoading(false);
        }
    }, [extractDataFromCatalog, clearData]);

    // Обновление данных (аналог fetchCatalogData)
    const refreshData = useCallback(async () => {
        await fetchCatalogData();
    }, [fetchCatalogData]);

    // Автоматическая загрузка данных при монтировании
    useEffect(() => {
        fetchCatalogData();
    }, [fetchCatalogData]);

    return {
        // Данные
        catalogData,
        categoriesData,
        productData,
        manufacturerData,
        stockWarehousesQuantityData,

        // Состояния
        loading,
        error,

        // Методы
        fetchCatalogData,
        refreshData,
        clearData,
    };
};