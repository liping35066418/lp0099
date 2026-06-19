import { create } from 'zustand';

export type ServiceCategory = 'wash' | 'beauty' | 'boarding' | 'health' | 'other';

export interface AddonService {
  id: string;
  name: string;
  price: number;
}

export interface DiscountTag {
  enabled: boolean;
  text: string;
  bgColor: string;
  textColor: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
}

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  name: string;
  basePrice: number;
  description: string;
  addons: AddonService[];
  discount: DiscountTag;
}

export interface CanvasModule {
  id: string;
  serviceItemId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CartItem {
  serviceItemId: string;
  selectedAddons: string[];
  quantity: number;
}

export type TemplateType = 'daily' | 'holiday';

export interface TemplateStyle {
  bgGradient: string;
  headerBg: string;
  headerText: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  priceColor: string;
  titleColor: string;
  accentColor: string;
}

export const TEMPLATE_STYLES: Record<TemplateType, TemplateStyle> = {
  daily: {
    bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
    headerBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    headerText: 'text-white',
    cardBg: 'bg-white',
    cardBorder: 'border-blue-100',
    cardShadow: 'shadow-blue-100',
    priceColor: 'text-blue-600',
    titleColor: 'text-gray-800',
    accentColor: 'bg-blue-500',
  },
  holiday: {
    bgGradient: 'from-red-50 via-orange-50 to-yellow-50',
    headerBg: 'bg-gradient-to-r from-red-600 to-orange-500',
    headerText: 'text-white',
    cardBg: 'bg-white',
    cardBorder: 'border-orange-200',
    cardShadow: 'shadow-orange-100',
    priceColor: 'text-red-600',
    titleColor: 'text-gray-800',
    accentColor: 'bg-red-500',
  },
};

export const CATEGORY_INFO: Record<ServiceCategory, { name: string; icon: string; color: string }> = {
  wash: { name: '洗护服务', icon: 'bath', color: 'bg-blue-100 text-blue-700' },
  beauty: { name: '美容造型', icon: 'scissors', color: 'bg-pink-100 text-pink-700' },
  boarding: { name: '宠物寄养', icon: 'home', color: 'bg-green-100 text-green-700' },
  health: { name: '健康护理', icon: 'heart-pulse', color: 'bg-red-100 text-red-700' },
  other: { name: '其他服务', icon: 'star', color: 'bg-purple-100 text-purple-700' },
};

const DEFAULT_SERVICE_ITEMS: ServiceItem[] = [
  {
    id: 'svc-1',
    category: 'wash',
    name: '基础洗澡',
    basePrice: 68,
    description: '包含洗澡、吹干、基础梳理',
    addons: [
      { id: 'addon-1-1', name: '深层清洁', price: 20 },
      { id: 'addon-1-2', name: 'SPA按摩', price: 30 },
    ],
    discount: { enabled: true, text: '新客优惠', bgColor: '#ef4444', textColor: '#ffffff', discountType: 'fixed', discountValue: 10 },
  },
  {
    id: 'svc-2',
    category: 'wash',
    name: '精致洗护',
    basePrice: 128,
    description: '专业洗护+蓬松造型+护毛素',
    addons: [
      { id: 'addon-2-1', name: '药浴护理', price: 50 },
      { id: 'addon-2-2', name: '口腔清洁', price: 30 },
    ],
    discount: { enabled: false, text: '', bgColor: '#ef4444', textColor: '#ffffff', discountType: 'fixed', discountValue: 0 },
  },
  {
    id: 'svc-3',
    category: 'beauty',
    name: '泰迪造型',
    basePrice: 158,
    description: '专业泰迪造型修剪',
    addons: [
      { id: 'addon-3-1', name: '染色挑染', price: 80 },
      { id: 'addon-3-2', name: '创意造型', price: 100 },
    ],
    discount: { enabled: true, text: '热门', bgColor: '#f59e0b', textColor: '#ffffff', discountType: 'percent', discountValue: 10 },
  },
  {
    id: 'svc-4',
    category: 'beauty',
    name: '猫咪精修',
    basePrice: 188,
    description: '猫咪专业美容修剪',
    addons: [
      { id: 'addon-4-1', name: '去毛球护理', price: 40 },
      { id: 'addon-4-2', name: '指甲护理', price: 20 },
    ],
    discount: { enabled: false, text: '', bgColor: '#ef4444', textColor: '#ffffff', discountType: 'fixed', discountValue: 0 },
  },
  {
    id: 'svc-5',
    category: 'boarding',
    name: '标准寄养',
    basePrice: 88,
    description: '每日价格，含早晚遛弯',
    addons: [
      { id: 'addon-5-1', name: '豪华单间', price: 40 },
      { id: 'addon-5-2', name: '24H监控', price: 20 },
    ],
    discount: { enabled: true, text: '3天9折', bgColor: '#10b981', textColor: '#ffffff', discountType: 'percent', discountValue: 10 },
  },
  {
    id: 'svc-6',
    category: 'boarding',
    name: 'VIP寄养',
    basePrice: 168,
    description: '独立空间+专人陪护',
    addons: [
      { id: 'addon-6-1', name: '每日视频', price: 30 },
      { id: 'addon-6-2', name: '加餐服务', price: 25 },
    ],
    discount: { enabled: false, text: '', bgColor: '#ef4444', textColor: '#ffffff', discountType: 'fixed', discountValue: 0 },
  },
  {
    id: 'svc-7',
    category: 'health',
    name: '基础体检',
    basePrice: 198,
    description: '体温、心率、皮毛等基础检查',
    addons: [
      { id: 'addon-7-1', name: '血常规', price: 80 },
      { id: 'addon-7-2', name: '便检', price: 50 },
    ],
    discount: { enabled: true, text: '会员专享', bgColor: '#8b5cf6', textColor: '#ffffff', discountType: 'fixed', discountValue: 30 },
  },
  {
    id: 'svc-8',
    category: 'health',
    name: '疫苗接种',
    basePrice: 120,
    description: '进口疫苗接种服务',
    addons: [
      { id: 'addon-8-1', name: '驱虫服务', price: 60 },
    ],
    discount: { enabled: false, text: '', bgColor: '#ef4444', textColor: '#ffffff', discountType: 'fixed', discountValue: 0 },
  },
];

const CANVAS_HEADER_SAFE_Y = 120;

const DEFAULT_CANVAS_MODULES: CanvasModule[] = [
  { id: 'mod-1', serviceItemId: 'svc-1', x: 20, y: CANVAS_HEADER_SAFE_Y, width: 280, height: 200 },
  { id: 'mod-2', serviceItemId: 'svc-2', x: 320, y: CANVAS_HEADER_SAFE_Y, width: 280, height: 200 },
  { id: 'mod-3', serviceItemId: 'svc-3', x: 20, y: CANVAS_HEADER_SAFE_Y + 220, width: 280, height: 200 },
  { id: 'mod-4', serviceItemId: 'svc-5', x: 320, y: CANVAS_HEADER_SAFE_Y + 220, width: 280, height: 200 },
  { id: 'mod-5', serviceItemId: 'svc-7', x: 20, y: CANVAS_HEADER_SAFE_Y + 440, width: 280, height: 200 },
];

interface PriceConfigState {
  template: TemplateType;
  serviceItems: ServiceItem[];
  canvasModules: CanvasModule[];
  selectedModuleId: string | null;
  cartItems: CartItem[];
  draggedServiceId: string | null;
  setTemplate: (template: TemplateType) => void;
  setSelectedModuleId: (id: string | null) => void;
  setDraggedServiceId: (id: string | null) => void;
  updateServiceItem: (id: string, updates: Partial<ServiceItem>) => void;
  updateServiceDiscount: (id: string, updates: Partial<DiscountTag>) => void;
  updateServiceAddon: (serviceId: string, addonId: string, updates: Partial<AddonService>) => void;
  addServiceAddon: (serviceId: string) => void;
  removeServiceAddon: (serviceId: string, addonId: string) => void;
  addModuleToCanvas: (serviceItemId: string, x: number, y: number) => void;
  updateModulePosition: (moduleId: string, x: number, y: number) => void;
  removeModuleFromCanvas: (moduleId: string) => void;
  addCartItem: (serviceItemId: string) => void;
  updateCartItemAddons: (cartIndex: number, addonId: string, selected: boolean) => void;
  updateCartItemQuantity: (cartIndex: number, quantity: number) => void;
  removeCartItem: (cartIndex: number) => void;
  clearCart: () => void;
  calculateCartItemPrice: (cartItem: CartItem) => { original: number; discount: number; final: number };
  calculateCartTotal: () => { originalTotal: number; totalDiscount: number; finalTotal: number };
}

export const usePriceConfigStore = create<PriceConfigState>((set, get) => ({
  template: 'daily',
  serviceItems: DEFAULT_SERVICE_ITEMS,
  canvasModules: DEFAULT_CANVAS_MODULES,
  selectedModuleId: null,
  cartItems: [
    { serviceItemId: 'svc-1', selectedAddons: ['addon-1-1'], quantity: 1 },
    { serviceItemId: 'svc-3', selectedAddons: [], quantity: 1 },
  ],
  draggedServiceId: null,

  setTemplate: (template) => set({ template }),
  setSelectedModuleId: (id) => set({ selectedModuleId: id }),
  setDraggedServiceId: (id) => set({ draggedServiceId: id }),

  updateServiceItem: (id, updates) =>
    set((state) => ({
      serviceItems: state.serviceItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  updateServiceDiscount: (id, updates) =>
    set((state) => ({
      serviceItems: state.serviceItems.map((item) =>
        item.id === id ? { ...item, discount: { ...item.discount, ...updates } } : item
      ),
    })),

  updateServiceAddon: (serviceId, addonId, updates) =>
    set((state) => ({
      serviceItems: state.serviceItems.map((item) =>
        item.id === serviceId
          ? {
              ...item,
              addons: item.addons.map((addon) =>
                addon.id === addonId ? { ...addon, ...updates } : addon
              ),
            }
          : item
      ),
    })),

  addServiceAddon: (serviceId) =>
    set((state) => ({
      serviceItems: state.serviceItems.map((item) =>
        item.id === serviceId
          ? {
              ...item,
              addons: [
                ...item.addons,
                { id: `addon-${Date.now()}`, name: '新附加服务', price: 0 },
              ],
            }
          : item
      ),
    })),

  removeServiceAddon: (serviceId, addonId) =>
    set((state) => ({
      serviceItems: state.serviceItems.map((item) =>
        item.id === serviceId
          ? { ...item, addons: item.addons.filter((a) => a.id !== addonId) }
          : item
      ),
    })),

  addModuleToCanvas: (serviceItemId, x, y) =>
    set((state) => ({
      canvasModules: [
        ...state.canvasModules,
        {
          id: `mod-${Date.now()}`,
          serviceItemId,
          x: Math.max(0, x - 140),
          y: Math.max(CANVAS_HEADER_SAFE_Y, y - 100),
          width: 280,
          height: 200,
        },
      ],
    })),

  updateModulePosition: (moduleId, x, y) =>
    set((state) => ({
      canvasModules: state.canvasModules.map((mod) =>
        mod.id === moduleId ? { ...mod, x: Math.max(0, x), y: Math.max(CANVAS_HEADER_SAFE_Y, y) } : mod
      ),
    })),

  removeModuleFromCanvas: (moduleId) =>
    set((state) => ({
      canvasModules: state.canvasModules.filter((m) => m.id !== moduleId),
      selectedModuleId: state.selectedModuleId === moduleId ? null : state.selectedModuleId,
    })),

  addCartItem: (serviceItemId) =>
    set((state) => ({
      cartItems: [...state.cartItems, { serviceItemId, selectedAddons: [], quantity: 1 }],
    })),

  updateCartItemAddons: (cartIndex, addonId, selected) =>
    set((state) => {
      const newCartItems = [...state.cartItems];
      const item = newCartItems[cartIndex];
      if (selected) {
        if (!item.selectedAddons.includes(addonId)) {
          item.selectedAddons = [...item.selectedAddons, addonId];
        }
      } else {
        item.selectedAddons = item.selectedAddons.filter((id) => id !== addonId);
      }
      return { cartItems: newCartItems };
    }),

  updateCartItemQuantity: (cartIndex, quantity) =>
    set((state) => {
      const newCartItems = [...state.cartItems];
      newCartItems[cartIndex] = {
        ...newCartItems[cartIndex],
        quantity: Math.max(1, quantity),
      };
      return { cartItems: newCartItems };
    }),

  removeCartItem: (cartIndex) =>
    set((state) => ({
      cartItems: state.cartItems.filter((_, i) => i !== cartIndex),
    })),

  clearCart: () => set({ cartItems: [] }),

  calculateCartItemPrice: (cartItem) => {
    const state = get();
    const service = state.serviceItems.find((s) => s.id === cartItem.serviceItemId);
    if (!service) return { original: 0, discount: 0, final: 0 };

    const addonsTotal = service.addons
      .filter((a) => cartItem.selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

    const original = (service.basePrice + addonsTotal) * cartItem.quantity;

    let discount = 0;
    if (service.discount.enabled) {
      const baseOriginal = service.basePrice * cartItem.quantity;
      if (service.discount.discountType === 'fixed') {
        discount = Math.min(service.discount.discountValue * cartItem.quantity, baseOriginal);
      } else {
        discount = Math.round((baseOriginal * service.discount.discountValue) / 100);
      }
      discount = Math.min(discount, original);
    }

    return { original, discount, final: Math.max(0, original - discount) };
  },

  calculateCartTotal: () => {
    const state = get();
    let originalTotal = 0;
    let totalDiscount = 0;

    state.cartItems.forEach((cartItem) => {
      const prices = state.calculateCartItemPrice(cartItem);
      originalTotal += prices.original;
      totalDiscount += prices.discount;
    });

    totalDiscount = Math.min(totalDiscount, originalTotal);

    return {
      originalTotal,
      totalDiscount,
      finalTotal: Math.max(0, originalTotal - totalDiscount),
    };
  },
}));
