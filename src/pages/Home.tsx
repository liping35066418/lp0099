import { useRef, useState, useEffect } from 'react';
import {
  Bath,
  Scissors,
  Home as HomeIcon,
  HeartPulse,
  Star,
  Sun,
  PartyPopper,
  Trash2,
  Plus,
  Minus,
  GripVertical,
  Settings,
  ShoppingCart,
  Sparkles,
  Tag,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  usePriceConfigStore,
  CATEGORY_INFO,
  TEMPLATE_STYLES,
  ServiceCategory,
  ServiceItem,
  CanvasModule,
} from '@/store/priceConfig';

const CATEGORY_ICONS: Record<ServiceCategory, React.ComponentType<{ className?: string }>> = {
  wash: Bath,
  beauty: Scissors,
  boarding: HomeIcon,
  health: HeartPulse,
  other: Star,
};

function CategoryIcon({ category, className }: { category: ServiceCategory; className?: string }) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon className={className} />;
}

function ServiceLibrary() {
  const { serviceItems, draggedServiceId, setDraggedServiceId, addCartItem } = usePriceConfigStore();
  const categories: ServiceCategory[] = ['wash', 'beauty', 'boarding', 'health'];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          服务项目库
        </h2>
        <p className="text-xs text-gray-500 mt-1">拖拽项目到画布，或点击添加到账单</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {categories.map((cat) => {
          const catInfo = CATEGORY_INFO[cat];
          const items = serviceItems.filter((s) => s.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat}>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2.5 ${catInfo.color}`}>
                <CategoryIcon category={cat} className="w-3.5 h-3.5" />
                {catInfo.name}
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggedServiceId(item.id)}
                    onDragEnd={() => setDraggedServiceId(null)}
                    onClick={() => addCartItem(item.id)}
                    className={`group p-3 rounded-lg border-2 cursor-move transition-all duration-200 hover:shadow-md bg-white ${
                      draggedServiceId === item.id
                        ? 'border-indigo-500 shadow-lg scale-[1.02] bg-indigo-50'
                        : 'border-gray-100 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400" />
                          <span className="font-semibold text-gray-800 text-sm truncate">{item.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 ml-5">{item.description}</p>
                        {item.addons.length > 0 && (
                          <div className="ml-5 mt-1.5 flex flex-wrap gap-1">
                            {item.addons.slice(0, 2).map((a) => (
                              <span key={a.id} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {a.name}+¥{a.price}
                              </span>
                            ))}
                            {item.addons.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                +{item.addons.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-indigo-600">¥{item.basePrice}</div>
                        {item.discount.enabled && (
                          <div
                            className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block font-medium"
                            style={{ backgroundColor: item.discount.bgColor, color: item.discount.textColor }}
                          >
                            {item.discount.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriceCanvas() {
  const {
    template,
    serviceItems,
    canvasModules,
    selectedModuleId,
    draggedServiceId,
    setSelectedModuleId,
    addModuleToCanvas,
    updateModulePosition,
    removeModuleFromCanvas,
  } = usePriceConfigStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const templateStyle = TEMPLATE_STYLES[template];

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedServiceId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addModuleToCanvas(draggedServiceId, x, y);
  };

  const handleModuleMouseDown = (e: React.MouseEvent, mod: CanvasModule) => {
    if ((e.target as HTMLElement).closest('.module-delete-btn')) return;
    e.stopPropagation();
    setSelectedModuleId(mod.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragging({
      id: mod.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragging.offsetX;
      const y = e.clientY - rect.top - dragging.offsetY;
      updateModulePosition(dragging.id, x, y);
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, updateModulePosition]);

  const getService = (id: string): ServiceItem | undefined => serviceItems.find((s) => s.id === id);

  return (
    <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            画布预览
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              户外公示牌尺寸 (620 × 800)
            </span>
          </h2>
        </div>
        <div className="text-xs text-gray-500">
          提示: 从左侧拖拽服务项目到画布，拖动卡片调整位置
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        <div
          ref={canvasRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          onClick={() => setSelectedModuleId(null)}
          className={`relative rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br ${templateStyle.bgGradient} border-8 border-gray-300`}
          style={{ width: 620, height: 800, flexShrink: 0 }}
        >
          <div className={`${templateStyle.headerBg} ${templateStyle.headerText} px-6 py-5`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black tracking-wider">🐾 萌宠生活馆</div>
                <div className="text-sm opacity-90 mt-1">
                  {template === 'daily' ? '☀️ 日常价目表' : '🎉 节假日特惠价目表'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">¥</div>
                <div className="text-xs opacity-75">明码标价 · 透明消费</div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5c0-2.25 1.75-4 4-4V8c-3.5 0-6.5 2.5-7.5 6H10V6h-2v8H0v2h8v2.5c0 2.25-1.75 4-4 4V20c3.5 0 6.5-2.5 7.5-6h2.5v9h2v-9h8.5c1 3.5 4 6 7.5 6v-.5c-2.25 0-4-1.75-4-4z' fill='%23000' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />

          {draggedServiceId && (
            <div className="absolute inset-0 bg-indigo-500/10 border-4 border-dashed border-indigo-400 flex items-center justify-center pointer-events-none z-10 rounded-lg m-4">
              <div className="bg-white px-6 py-3 rounded-xl shadow-lg text-indigo-600 font-bold">
                🎯 释放鼠标添加服务项目
              </div>
            </div>
          )}

          {canvasModules.map((mod) => {
            const service = getService(mod.serviceItemId);
            if (!service) return null;
            const catInfo = CATEGORY_INFO[service.category];
            const isSelected = selectedModuleId === mod.id;

            return (
              <div
                key={mod.id}
                onMouseDown={(e) => handleModuleMouseDown(e, mod)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModuleId(mod.id);
                }}
                className={`absolute rounded-xl transition-shadow duration-200 select-none ${templateStyle.cardBg} border-2 ${templateStyle.cardBorder} shadow-lg ${templateStyle.cardShadow} ${
                  isSelected ? 'ring-4 ring-indigo-500 ring-offset-2 z-20 shadow-2xl' : 'hover:shadow-xl cursor-move z-10'
                } ${dragging?.id === mod.id ? 'opacity-80 scale-[1.02]' : ''}`}
                style={{
                  left: mod.x,
                  top: mod.y,
                  width: mod.width,
                  height: mod.height,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeModuleFromCanvas(mod.id);
                  }}
                  className="module-delete-btn absolute -top-2.5 -right-2.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ opacity: isSelected ? 1 : undefined }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="h-full flex flex-col p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${catInfo.color} mb-1.5`}>
                        <CategoryIcon category={service.category} className="w-3 h-3" />
                        {catInfo.name}
                      </div>
                      <div className={`font-bold ${templateStyle.titleColor} text-base leading-tight`}>
                        {service.name}
                      </div>
                    </div>
                    {service.discount.enabled && (
                      <div
                        className="px-2 py-1 rounded-md text-[11px] font-bold shadow-sm whitespace-nowrap"
                        style={{ backgroundColor: service.discount.bgColor, color: service.discount.textColor }}
                      >
                        <Tag className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                        {service.discount.text}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-2 line-clamp-2 flex-shrink-0">
                    {service.description}
                  </div>

                  {service.addons.length > 0 && (
                    <div className="flex-1 min-h-0 mb-2">
                      <div className="text-[10px] text-gray-400 font-medium mb-1">附加服务:</div>
                      <div className="flex flex-wrap gap-1">
                        {service.addons.slice(0, 3).map((a) => (
                          <span key={a.id} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {a.name} +¥{a.price}
                          </span>
                        ))}
                        {service.addons.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                            +{service.addons.length - 3}项
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex items-end justify-between pt-2 border-t border-gray-100">
                    <div className={`text-2xl font-black ${templateStyle.priceColor}`}>
                      ¥{service.basePrice}
                      <span className="text-xs font-normal text-gray-400 ml-0.5">起</span>
                    </div>
                    {service.discount.enabled && (
                      <div className="text-[11px] text-gray-500 text-right">
                        {service.discount.discountType === 'fixed' ? (
                          <span className="text-red-500 font-semibold">立减¥{service.discount.discountValue}</span>
                        ) : (
                          <span className="text-red-500 font-semibold">{service.discount.discountValue}% OFF</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className={`absolute bottom-0 left-0 right-0 px-6 py-3 ${templateStyle.headerBg} ${templateStyle.headerText}`}>
            <div className="flex items-center justify-between text-xs">
              <span>📞 预约电话: 400-888-8888</span>
              <span className="opacity-90">📍 萌宠生活馆 · 欢迎光临</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigPanel() {
  const {
    template,
    setTemplate,
    serviceItems,
    selectedModuleId,
    canvasModules,
    updateServiceItem,
    updateServiceDiscount,
    updateServiceAddon,
    addServiceAddon,
    removeServiceAddon,
  } = usePriceConfigStore();

  const selectedModule = canvasModules.find((m) => m.id === selectedModuleId);
  const selectedService = selectedModule
    ? serviceItems.find((s) => s.id === selectedModule.serviceItemId)
    : serviceItems[0];

  if (!selectedService) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col">
        <div className="text-center text-gray-400 mt-20">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">请选择画布中的卡片进行配置</p>
        </div>
      </div>
    );
  }

  const catInfo = CATEGORY_INFO[selectedService.category];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
          <Settings className="w-5 h-5 text-indigo-500" />
          配置面板
        </h2>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setTemplate('daily')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${
              template === 'daily'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Sun className="w-4 h-4" />
            日常模板
          </button>
          <button
            onClick={() => setTemplate('holiday')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${
              template === 'holiday'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PartyPopper className="w-4 h-4" />
            节假日
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className={`p-3 rounded-lg ${catInfo.color} bg-opacity-30`}>
          <div className="flex items-center gap-2">
            <CategoryIcon category={selectedService.category} className="w-5 h-5" />
            <span className="text-sm font-semibold">{catInfo.name}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">基础信息</div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
            <input
              type="text"
              value={selectedService.name}
              onChange={(e) => updateServiceItem(selectedService.id, { name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
            <textarea
              value={selectedService.description}
              onChange={(e) => updateServiceItem(selectedService.id, { description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">基础价格 (元)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">¥</span>
              <input
                type="number"
                min={0}
                value={selectedService.basePrice}
                onChange={(e) => updateServiceItem(selectedService.id, { basePrice: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">附加服务</div>
            <button
              onClick={() => addServiceAddon(selectedService.id)}
              className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              添加
            </button>
          </div>
          <div className="space-y-2">
            {selectedService.addons.map((addon) => (
              <div key={addon.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={addon.name}
                      onChange={(e) => updateServiceAddon(selectedService.id, addon.id, { name: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">¥</span>
                      <input
                        type="number"
                        min={0}
                        value={addon.price}
                        onChange={(e) => updateServiceAddon(selectedService.id, addon.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeServiceAddon(selectedService.id, addon.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {selectedService.addons.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                暂无附加服务，点击上方添加
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              优惠标签
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedService.discount.enabled}
                onChange={(e) => updateServiceDiscount(selectedService.id, { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          {selectedService.discount.enabled && (
            <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">标签文字</label>
                <input
                  type="text"
                  value={selectedService.discount.text}
                  onChange={(e) => updateServiceDiscount(selectedService.id, { text: e.target.value })}
                  placeholder="如: 新客优惠"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">背景色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedService.discount.bgColor}
                      onChange={(e) => updateServiceDiscount(selectedService.id, { bgColor: e.target.value })}
                      className="w-10 h-9 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedService.discount.bgColor}
                      onChange={(e) => updateServiceDiscount(selectedService.id, { bgColor: e.target.value })}
                      className="flex-1 px-2 py-2 bg-white border border-gray-200 rounded text-xs font-mono focus:ring-1 focus:ring-red-400 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">文字色</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedService.discount.textColor}
                      onChange={(e) => updateServiceDiscount(selectedService.id, { textColor: e.target.value })}
                      className="w-10 h-9 rounded border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedService.discount.textColor}
                      onChange={(e) => updateServiceDiscount(selectedService.id, { textColor: e.target.value })}
                      className="flex-1 px-2 py-2 bg-white border border-gray-200 rounded text-xs font-mono focus:ring-1 focus:ring-red-400 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">优惠方式</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateServiceDiscount(selectedService.id, { discountType: 'fixed' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedService.discount.discountType === 'fixed'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
                    }`}
                  >
                    固定减免
                  </button>
                  <button
                    onClick={() => updateServiceDiscount(selectedService.id, { discountType: 'percent' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedService.discount.discountType === 'percent'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
                    }`}
                  >
                    折扣
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {selectedService.discount.discountType === 'fixed' ? '减免金额 (元)' : '折扣比例 (%)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    {selectedService.discount.discountType === 'fixed' ? '¥' : ''}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={selectedService.discount.discountType === 'percent' ? 100 : undefined}
                    value={selectedService.discount.discountValue}
                    onChange={(e) => updateServiceDiscount(selectedService.id, { discountValue: Math.max(0, Number(e.target.value) || 0) })}
                    className={`w-full pl-8 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-red-600 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    {selectedService.discount.discountType === 'percent' ? '%' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            实时效果预览
          </div>
          <div className="text-xs text-indigo-600 space-y-1">
            <p>所有修改实时同步到画布预览</p>
            <p>切换模板即时刷新配色方案</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingPanel() {
  const {
    cartItems,
    serviceItems,
    template,
    addCartItem,
    updateCartItemAddons,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    calculateCartItemPrice,
    calculateCartTotal,
  } = usePriceConfigStore();

  const [expanded, setExpanded] = useState(true);
  const totals = calculateCartTotal();
  const templateStyle = TEMPLATE_STYLES[template];

  return (
    <div className={`border-t-4 ${templateStyle.accentColor} bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)]`}>
      <div
        className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${templateStyle.accentColor} text-white flex items-center justify-center shadow-lg`}>
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-800 flex items-center gap-2">
              模拟账单计算器
              {cartItems.length > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                  {cartItems.length}项
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">选择服务组合，实时计算应付总价</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-gray-500">原价合计</div>
            <div className="text-sm text-gray-400 line-through">¥{totals.originalTotal}</div>
          </div>
          {totals.totalDiscount > 0 && (
            <div className="text-right">
              <div className="text-xs text-red-500">优惠减免</div>
              <div className="text-sm font-bold text-red-500">-¥{totals.totalDiscount}</div>
            </div>
          )}
          <div className="text-right">
            <div className="text-xs text-gray-500">应付总价</div>
            <div className={`text-2xl font-black ${templateStyle.priceColor}`}>
              ¥{totals.finalTotal}
            </div>
          </div>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">账单为空，点击左侧服务项目添加到账单</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {serviceItems.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => addCartItem(s.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${templateStyle.accentColor} text-white shadow-md`}
                  >
                    + {s.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {cartItems.map((cartItem, idx) => {
                const service = serviceItems.find((s) => s.id === cartItem.serviceItemId);
                if (!service) return null;
                const prices = calculateCartItemPrice(cartItem);
                const catInfo = CATEGORY_INFO[service.category];

                return (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className={`w-9 h-9 rounded-lg ${catInfo.color} flex items-center justify-center flex-shrink-0`}>
                          <CategoryIcon category={service.category} className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 text-sm truncate">{service.name}</div>
                          <div className="text-xs text-gray-400">基础 ¥{service.basePrice}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCartItem(idx)}
                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {service.addons.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <div className="text-[11px] font-medium text-gray-500 mb-1.5">附加服务:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {service.addons.map((a) => {
                            const selected = cartItem.selectedAddons.includes(a.id);
                            return (
                              <button
                                key={a.id}
                                onClick={() => updateCartItemAddons(idx, a.id, !selected)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                                  selected
                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                                    : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                                }`}
                              >
                                {selected && '✓ '}
                                {a.name} +¥{a.price}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartItemQuantity(idx, cartItem.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-800 text-sm">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(idx, cartItem.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        {prices.discount > 0 && (
                          <div className="text-[11px] text-red-500 font-medium">
                            已减 ¥{prices.discount}
                          </div>
                        )}
                        <div className={`text-lg font-black ${templateStyle.priceColor}`}>
                          ¥{prices.final}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className={`rounded-xl p-5 ${templateStyle.headerBg} ${templateStyle.headerText} shadow-lg`}>
                <div className="text-sm opacity-90 mb-3 font-medium">费用明细</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="opacity-80">商品原价</span>
                    <span className="font-semibold">¥{totals.originalTotal}</span>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="opacity-80">优惠减免</span>
                      <span className="font-bold text-yellow-200">-¥{totals.totalDiscount}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/20 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">应付金额</span>
                    <span className="text-3xl font-black">¥{totals.finalTotal}</span>
                  </div>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20 text-xs text-yellow-200">
                    ✨ 优惠金额已限制不超过订单原价
                  </div>
                )}
                <button
                  onClick={clearCart}
                  className="mt-4 w-full py-2.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                >
                  清空账单
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden">
      <div className="flex-1 flex min-h-0">
        <div className="w-72 flex-shrink-0 min-h-0">
          <ServiceLibrary />
        </div>
        <PriceCanvas />
        <ConfigPanel />
      </div>
      <BillingPanel />
    </div>
  );
}
