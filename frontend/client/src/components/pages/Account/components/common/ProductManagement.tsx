import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Table, Alert, InputGroup } from 'react-bootstrap';
import { getProducts, Product } from '../../../../servicesApi/ProductsApi';
import { getCategories, Categories } from '../../../../servicesApi/CategoriesApi';
import { getManufacturers, Manufacturer } from '../../../../servicesApi/ManufacturersApi';
import styles from '../AdminPanel.module.css';

interface ProductManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ show, onHide, onRefresh }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Categories[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        partNumber: '',
        price: 0,
        image: '',
        details: '',
        categories_Id: 0,
        manufacturers_Id: 0
    });

    useEffect(() => {
        if (show) {
            loadData();
        }
    }, [show]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData, manufacturersData] = await Promise.all([
                getProducts(),
                getCategories(),
                getManufacturers()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setManufacturers(manufacturersData);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    // Фильтрация товаров по поисковому запросу (по всем полям)
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return products;
        
        const term = searchTerm.toLowerCase().trim();
        return products.filter(product => 
            product.name.toLowerCase().includes(term) ||
            product.partNumber.toLowerCase().includes(term) ||
            product.price.toString().includes(term) ||
            categories.find(c => c.id === product.categories_Id)?.name.toLowerCase().includes(term) ||
            manufacturers.find(m => m.id === product.manufacturers_Id)?.name.toLowerCase().includes(term) ||
            (product.details && product.details.toLowerCase().includes(term))
        );
    }, [products, searchTerm, categories, manufacturers]);

    const handleSave = async () => {
        if (!formData.name || !formData.partNumber || formData.price <= 0) {
            alert('Заполните обязательные поля');
            return;
        }

        try {
            if (editingProduct) {
                //await updateProduct(editingProduct.id, formData);
                alert('Товар обновлен');
            } else {
                //await createProduct(formData);
                alert('Товар добавлен');
            }
            resetForm();
            await loadData();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить товар');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            partNumber: '',
            price: 0,
            image: '',
            details: '',
            categories_Id: 0,
            manufacturers_Id: 0
        });
        setEditingProduct(null);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        // setFormData({
        //     name: product.name,
        //     partNumber: product.partNumber,
        //     price: product.price,
        //     image: product.image || '',
        //     details: product.details || '',
        //     categories_Id: product.categories_Id,
        //     manufacturers_Id: product.manufacturers_Id
        // });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Удалить товар?')) {
            try {
                //await deleteProduct(id);
                alert('Товар удален');
                await loadData();
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error('Ошибка удаления:', error);
                alert('Не удалось удалить товар');
            }
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Управление товарами</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={5}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Список товаров</h5>
                            <Button 
                                size="sm" 
                                variant="outline-primary" 
                                onClick={loadData}
                                disabled={loading}
                            >
                                🔄 Обновить
                            </Button>
                        </div>
                        
                        {/* Поисковая строка */}
                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="🔍 Поиск по названию, артикулу, цене, категории, бренду..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <Button variant="outline-secondary" onClick={clearSearch}>
                                    ✕
                                </Button>
                            )}
                        </InputGroup>
                        
                        {/* Результаты поиска */}
                        <div className={styles.itemsList}>
                            {loading ? (
                                <p className="text-center">Загрузка...</p>
                            ) : filteredProducts.length === 0 ? (
                                <p className="text-center text-muted">
                                    {searchTerm ? 'Товары не найдены' : 'Нет товаров'}
                                </p>
                            ) : (
                                <>
                                    <div className={styles.searchInfo}>
                                        Найдено: {filteredProducts.length} из {products.length}
                                    </div>
                                    {filteredProducts.map(product => (
                                        <div key={product.id} className={styles.listItem}>
                                            <div className={styles.itemInfo}>
                                                <strong>{product.name}</strong>
                                                <span className="text-muted">Арт: {product.partNumber}</span>
                                                <span>{product.price} ₽</span>
                                                <span className="text-muted small">
                                                    {categories.find(c => c.id === product.categories_Id)?.name} / 
                                                    {manufacturers.find(m => m.id === product.manufacturers_Id)?.name}
                                                </span>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-primary" 
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    ✎
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline-danger" 
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Col>
                    <Col md={7}>
                        <h5>{editingProduct ? 'Редактирование товара' : 'Добавление товара'}</h5>
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Название товара *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Введите название"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Артикул *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.partNumber}
                                            onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                                            placeholder="Введите артикул"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Цена *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            placeholder="Введите цену"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>URL изображения</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Категория *</Form.Label>
                                        <Form.Select
                                            value={formData.categories_Id}
                                            onChange={(e) => setFormData({ ...formData, categories_Id: Number(e.target.value) })}
                                        >
                                            <option value={0}>Выберите категорию</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Бренд *</Form.Label>
                                        <Form.Select
                                            value={formData.manufacturers_Id}
                                            onChange={(e) => setFormData({ ...formData, manufacturers_Id: Number(e.target.value) })}
                                        >
                                            <option value={0}>Выберите бренд</option>
                                            {manufacturers.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Описание</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    placeholder="Введите описание товара"
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Закрыть</Button>
                {editingProduct ? (
                    <Button variant="primary" onClick={handleSave}>Сохранить изменения</Button>
                ) : (
                    <Button variant="primary" onClick={handleSave}>Добавить товар</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};