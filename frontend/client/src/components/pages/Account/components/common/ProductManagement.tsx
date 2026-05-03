import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';

import { createProduct, deleteProduct, getProducts, Product, updateProduct } from '../../../../servicesApi/ProductsApi';
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
    const [saving, setSaving] = useState(false);
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
        } else {
            resetAllStates();
        }
    }, [show]);

    const resetAllStates = () => {
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
        setSearchTerm('');
        setProducts([]);
        setCategories([]);
        setManufacturers([]);
    };

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
        } catch (error: any) {
            console.error('Ошибка загрузки данных:', error);
            alert(error.serverMessage || 'Не удалось загрузить список товаров');
        } finally {
            setLoading(false);
        }
    };

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
        if (!formData.name.trim() || !formData.partNumber.trim() || formData.price <= 0) {
            alert('Заполните обязательные поля (название, артикул, цена)');
            return;
        }

        if (!formData.categories_Id || !formData.manufacturers_Id) {
            alert('Выберите категорию и бренд');
            return;
        }

        setSaving(true);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
                alert('Товар успешно обновлен');
            } else {
                await createProduct(formData);
                alert('Товар успешно добавлен');
            }
            resetForm();
            await loadData();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('Ошибка сохранения:', error);
            if (error.serverMessage) {
                alert(error.serverMessage);
            } else if (error.message) {
                alert(error.message);
            } else {
                alert('Не удалось сохранить товар');
            }
        } finally {
            setSaving(false);
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

    const clearForm = () => {
        setFormData({
            name: '',
            partNumber: '',
            price: 0,
            image: '',
            details: '',
            categories_Id: 0,
            manufacturers_Id: 0
        });
        if (editingProduct) {
            setEditingProduct(null);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            partNumber: product.partNumber,
            price: product.price,
            image: product.image || '',
            details: product.details || '',
            categories_Id: product.categories_Id ?? 0,
            manufacturers_Id: product.manufacturers_Id ?? 0
        });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Удалить товар?')) {
            setSaving(true);
            try {
                await deleteProduct(id);
                alert('Товар успешно удален');
                await loadData();
                if (onRefresh) onRefresh();
            } catch (error: any) {
                console.error('Ошибка удаления:', error);
                if (error.serverMessage) {
                    alert(error.serverMessage);
                } else if (error.message) {
                    alert(error.message);
                } else {
                    alert('Не удалось удалить товар');
                }
            } finally {
                setSaving(false);
            }
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleClose = () => {
        resetAllStates();
        onHide();
    };

    const getCategoryName = (id: number) => {
        return categories.find(c => c.id === id)?.name || '—';
    };

    const getManufacturerName = (id: number) => {
        return manufacturers.find(m => m.id === id)?.name || '—';
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
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
                                                <span className={styles.itemArticle}>Арт: {product.partNumber}</span>
                                                <span className={styles.itemPrice}>{product.price} ₽</span>
                                                <span className={styles.itemMeta}>
                                                    {getCategoryName(product.categories_Id)} / {getManufacturerName(product.manufacturers_Id)}
                                                </span>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <Button
                                                    size="sm"
                                                    className={styles.editBtn}
                                                    onClick={() => handleEdit(product)}
                                                    disabled={saving}
                                                >
                                                    ✎
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={saving}
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
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>{editingProduct ? 'Редактирование товара' : 'Добавление товара'}</h5>
                            {!editingProduct && (
                                <Button size="sm" variant="outline-secondary" onClick={clearForm} disabled={saving}>
                                    🗑️ Очистить
                                </Button>
                            )}
                        </div>
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
                                            disabled={saving}
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
                                            disabled={saving}
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
                                            min="0"
                                            step="0.01"
                                            disabled={saving}
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
                                            placeholder="https://example.com/image.jpg"
                                            disabled={saving}
                                        />
                                        <small className="text-muted">Ссылка на изображение товара</small>
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
                                            disabled={saving}
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
                                            disabled={saving}
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
                                    rows={4}
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    placeholder="Введите описание товара"
                                    disabled={saving}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2 mt-3">
                                {!editingProduct && (
                                    <Button variant="secondary" onClick={clearForm} className="flex-grow-1" disabled={saving}>
                                        🗑️ Очистить форму
                                    </Button>
                                )}
                                <Button
                                    className={styles.saveBtn}
                                    onClick={handleSave}
                                    disabled={saving || !formData.name.trim() || !formData.partNumber.trim() || formData.price <= 0 || !formData.categories_Id || !formData.manufacturers_Id}
                                    style={{ flex: editingProduct ? 1 : 2 }}
                                >
                                    {saving ? 'Сохранение...' : (editingProduct ? 'Сохранить изменения' : '➕ Добавить товар')}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={saving}>Закрыть</Button>
            </Modal.Footer>
        </Modal>
    );
};