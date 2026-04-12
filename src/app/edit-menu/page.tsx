"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Plus, X, Search, Edit2 } from "lucide-react";
import { useOrder, MenuItem } from "@/context/OrderContext";
import { useRouter } from "next/navigation";

export default function EditMenuPage() {
  const { menuItems, addMenuItem, deleteMenuItem, updateMenuItem } = useOrder();
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const router = useRouter();
  
  // Add item state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  // Edit item state
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    addMenuItem({ name: newItemName, price: newItemPrice });
    setNewItemName("");
    setNewItemPrice("");
    setIsAddingItem(false);
  };

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      deleteMenuItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const openEditPopup = (item: MenuItem) => {
    setItemToEdit(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price);
  };

  const handleUpdateItem = () => {
    if (!itemToEdit || !editItemName.trim() || !editItemPrice.trim()) return;
    updateMenuItem({ id: itemToEdit.id, name: editItemName, price: editItemPrice });
    setItemToEdit(null);
  };

  return (
    <main className="min-h-[100dvh] bg-background w-full flex flex-col pt-6 pb-24 relative font-body max-w-[800px] mx-auto">
      <div className="px-6 lg:px-12 w-full flex flex-col flex-1 h-full animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="w-12 h-12 bg-surface hover:bg-muted/10 shadow-[var(--shadow-soft)] text-text rounded-full flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-heading text-[28px] sm:text-[34px] tracking-tight text-text">
              Edit Menu
            </h1>
          </div>
          <button 
            onClick={() => setIsAddingItem(true)}
            className="w-14 h-14 bg-primary hover:bg-[#c44e2b] text-white rounded-full flex items-center justify-center transition-colors shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 z-10"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items to edit..."
            className="w-full h-[56px] pl-[50px] pr-5 bg-surface shadow-[var(--shadow-soft)] border border-transparent focus:border-primary/20 rounded-full text-text placeholder:text-[#A99790] focus:outline-none transition-all font-medium text-[16px]"
          />
        </div>

        {/* Items List */}
        <div className="flex flex-col gap-4 pb-20">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
               <div key={item.id} className="bg-surface rounded-[24px] p-5 flex items-center justify-between shadow-sm border border-transparent hover:border-black/5 transition-all">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-[18px] sm:text-[20px] text-text">
                      {item.name}
                    </span>
                    <span className="font-semibold text-primary text-[15px] sm:text-[16px]">
                      ₹{item.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditPopup(item)}
                      className="w-10 h-10 bg-muted/10 hover:bg-muted/20 text-text rounded-full flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setItemToDelete(item.id)}
                      className="w-10 h-10 bg-red-50 hover:bg-red-100 text-[#D95D39] rounded-full flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            ))
          ) : (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-surface shadow-sm rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-muted/60" />
              </div>
              <p className="text-text font-bold text-[20px] mb-2">No items found</p>
              <p className="text-muted text-[15px]">Try adjusting your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {itemToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-[360px] rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 bg-red-50 text-[#D95D39] rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-[26px] font-bold mb-3 text-text">Delete Item?</h2>
            <p className="text-muted text-[16px] mb-8 leading-relaxed">This action cannot be undone and it will be permanently removed from your menu.</p>
            
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 h-[56px] bg-background border border-black/5 hover:bg-muted/10 text-text font-bold text-[16px] rounded-[20px] transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 h-[56px] bg-[#D95D39] hover:bg-red-600 text-white font-bold text-[16px] rounded-[20px] transition-colors shadow-[var(--shadow-soft)] active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Popup */}
      {isAddingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-surface w-full max-w-[420px] rounded-[32px] p-8 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
              <button 
                onClick={() => setIsAddingItem(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-background border border-black/5 shadow-sm hover:bg-muted/10 text-muted hover:text-text rounded-full flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="font-heading text-[28px] font-bold mb-8 text-text pr-10">New Menu Item</h2>

              <div className="flex flex-col gap-5 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-text ml-1 opacity-90">Item Name</label>
                  <input 
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full h-[60px] px-5 bg-background shadow-sm border border-transparent focus:border-primary/20 rounded-[20px] text-text font-semibold text-[16px] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    placeholder="e.g. Avocado Toast"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-text ml-1 opacity-90">Price (₹)</label>
                  <input 
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full h-[60px] px-5 bg-background shadow-sm border border-transparent focus:border-primary/20 rounded-[20px] text-text font-semibold text-[16px] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    placeholder="e.g. 299"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddItem}
                disabled={!newItemName.trim() || !newItemPrice.trim()}
                className="w-full h-[64px] bg-primary hover:bg-[#c44e2b] disabled:opacity-50 disabled:hover:bg-primary text-white font-bold text-[18px] rounded-[22px] transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center"
              >
                Add to Menu
              </button>
           </div>
        </div>
      )}

      {/* Edit Item Popup */}
      {itemToEdit !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-surface w-full max-w-[420px] rounded-[32px] p-8 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
              <button 
                onClick={() => setItemToEdit(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-background border border-black/5 shadow-sm hover:bg-muted/10 text-muted hover:text-text rounded-full flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="font-heading text-[28px] font-bold mb-8 text-text pr-10">Edit Menu Item</h2>

              <div className="flex flex-col gap-5 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-text ml-1 opacity-90">Item Name</label>
                  <input 
                    type="text"
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                    className="w-full h-[60px] px-5 bg-background shadow-sm border border-transparent focus:border-primary/20 rounded-[20px] text-text font-semibold text-[16px] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-text ml-1 opacity-90">Price (₹)</label>
                  <input 
                    type="number"
                    value={editItemPrice}
                    onChange={(e) => setEditItemPrice(e.target.value)}
                    className="w-full h-[60px] px-5 bg-background shadow-sm border border-transparent focus:border-primary/20 rounded-[20px] text-text font-semibold text-[16px] focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleUpdateItem}
                disabled={!editItemName.trim() || !editItemPrice.trim()}
                className="w-full h-[64px] bg-primary hover:bg-[#c44e2b] disabled:opacity-50 disabled:hover:bg-primary text-white font-bold text-[18px] rounded-[22px] transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center"
              >
                Update Item
              </button>
           </div>
        </div>
      )}
    </main>
  );
}
