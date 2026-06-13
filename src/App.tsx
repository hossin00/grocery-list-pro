import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, ShoppingCart, X, Tag, RefreshCw } from 'lucide-react'

const ACCENT = '#16A34A'

interface GroceryItem {
  id: string
  name: string
  qty: string
  category: string
  checked: boolean
  note: string
}

interface GroceryList {
  id: string
  name: string
  items: GroceryItem[]
  created: string
}

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Pantry', 'Snacks', 'Drinks', 'Household', 'Other']

const CAT_COLORS: Record<string, string> = {
  Produce: '#16A34A', Dairy: '#60A5FA', Meat: '#F87171', Bakery: '#FBBF24',
  Frozen: '#818CF8', Pantry: '#F97316', Snacks: '#EC4899', Drinks: '#14B8A6',
  Household: '#94A3B8', Other: '#78716C',
}

const QUICK_ITEMS = [
  { name: 'Milk', category: 'Dairy', qty: '1L' },
  { name: 'Eggs', category: 'Dairy', qty: '12' },
  { name: 'Bread', category: 'Bakery', qty: '1 loaf' },
  { name: 'Butter', category: 'Dairy', qty: '250g' },
  { name: 'Chicken', category: 'Meat', qty: '1kg' },
  { name: 'Bananas', category: 'Produce', qty: '1 bunch' },
  { name: 'Apples', category: 'Produce', qty: '6' },
  { name: 'Tomatoes', category: 'Produce', qty: '500g' },
  { name: 'Pasta', category: 'Pantry', qty: '500g' },
  { name: 'Rice', category: 'Pantry', qty: '1kg' },
  { name: 'Olive Oil', category: 'Pantry', qty: '500ml' },
  { name: 'Coffee', category: 'Drinks', qty: '250g' },
]

export default function App() {
  const [lists, setLists] = useState<GroceryList[]>(() => {
    try { return JSON.parse(localStorage.getItem('grocery_lists') || '[]') } catch { return [] }
  })
  const [activeId, setActiveId] = useState<string>('')
  const [tab, setTab] = useState<'list' | 'lists'>('list')
  const [showAdd, setShowAdd] = useState(false)
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [form, setForm] = useState({ name: '', qty: '', category: 'Produce', note: '' })
  const [filterCat, setFilterCat] = useState('All')

  useEffect(() => {
    localStorage.setItem('grocery_lists', JSON.stringify(lists))
  }, [lists])

  useEffect(() => {
    if (lists.length > 0 && !activeId) setActiveId(lists[0].id)
  }, [lists])

  const activeList = lists.find(l => l.id === activeId)

  function createList() {
    if (!newListName.trim()) return
    const list: GroceryList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      items: [],
      created: new Date().toLocaleDateString(),
    }
    setLists(prev => [...prev, list])
    setActiveId(list.id)
    setNewListName('')
    setShowNewList(false)
    setTab('list')
  }

  function deleteList(id: string) {
    setLists(prev => prev.filter(l => l.id !== id))
    if (activeId === id) setActiveId(lists.find(l => l.id !== id)?.id || '')
  }

  function addItem() {
    if (!form.name.trim() || !activeId) return
    const item: GroceryItem = {
      id: Date.now().toString(),
      name: form.name.trim(),
      qty: form.qty.trim(),
      category: form.category,
      checked: false,
      note: form.note.trim(),
    }
    setLists(prev => prev.map(l => l.id === activeId ? { ...l, items: [...l.items, item] } : l))
    setForm({ name: '', qty: '', category: form.category, note: '' })
    setShowAdd(false)
  }

  function quickAdd(qi: typeof QUICK_ITEMS[0]) {
    if (!activeId) return
    const item: GroceryItem = {
      id: Date.now().toString(),
      name: qi.name,
      qty: qi.qty,
      category: qi.category,
      checked: false,
      note: '',
    }
    setLists(prev => prev.map(l => l.id === activeId ? { ...l, items: [...l.items, item] } : l))
  }

  function toggleItem(itemId: string) {
    setLists(prev => prev.map(l => l.id === activeId
      ? { ...l, items: l.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) }
      : l))
  }

  function deleteItem(itemId: string) {
    setLists(prev => prev.map(l => l.id === activeId
      ? { ...l, items: l.items.filter(i => i.id !== itemId) }
      : l))
  }

  function clearChecked() {
    setLists(prev => prev.map(l => l.id === activeId
      ? { ...l, items: l.items.filter(i => !i.checked) }
      : l))
  }

  const items = activeList?.items || []
  const filtered = filterCat === 'All' ? items : items.filter(i => i.category === filterCat)
  const unchecked = filtered.filter(i => !i.checked)
  const checked = filtered.filter(i => i.checked)
  const checkedCount = items.filter(i => i.checked).length

  const groupedUnchecked = CATEGORIES.reduce<Record<string, GroceryItem[]>>((acc, cat) => {
    const catItems = unchecked.filter(i => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0A0F0A', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ background: '#111811', padding: '20px 20px 0', borderBottom: '1px solid #1E2A1E' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={22} color={ACCENT} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{activeList ? activeList.name : 'Grocery List'}</div>
              {activeList && <div style={{ fontSize: 11, color: '#666' }}>{items.length} items · {checkedCount} done</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {checkedCount > 0 && (
              <button onClick={clearChecked}
                style={{ background: '#1E2A1E', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#888', cursor: 'pointer' }}>
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {(['list', 'lists'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', color: tab === t ? ACCENT : '#666', fontWeight: tab === t ? 600 : 400, fontSize: 14, borderBottom: `2px solid ${tab === t ? ACCENT : 'transparent'}` }}>
              {t === 'list' ? 'Shopping' : 'My Lists'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
        {tab === 'list' && (
          <>
            {!activeList ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <ShoppingCart size={48} color="#333" style={{ margin: '0 auto 16px' }} />
                <div style={{ color: '#555', marginBottom: 20 }}>No list selected</div>
                <button onClick={() => { setTab('lists'); setShowNewList(true) }}
                  style={{ background: ACCENT, border: 'none', borderRadius: 10, padding: '12px 24px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  Create a List
                </button>
              </div>
            ) : (
              <>
                {/* Category filter */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
                  {['All', ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setFilterCat(cat)}
                      style={{ background: filterCat === cat ? (CAT_COLORS[cat] || ACCENT) : '#1A2A1A', border: 'none', borderRadius: 16, padding: '4px 12px', color: filterCat === cat ? '#fff' : '#888', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: filterCat === cat ? 600 : 400 }}>
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Unchecked grouped by category */}
                {Object.entries(groupedUnchecked).map(([cat, catItems]) => (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[cat] || '#888' }} />
                      <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{cat}</span>
                    </div>
                    {catItems.map(item => (
                      <div key={item.id}
                        style={{ background: '#111811', borderRadius: 10, padding: '12px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => toggleItem(item.id)}
                          style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${CAT_COLORS[item.category] || ACCENT}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                          {(item.qty || item.note) && (
                            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                              {item.qty && <span style={{ color: CAT_COLORS[item.category] || ACCENT }}>{item.qty}</span>}
                              {item.qty && item.note && ' · '}
                              {item.note}
                            </div>
                          )}
                        </div>
                        <button onClick={() => deleteItem(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Checked items */}
                {checked.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 8, fontWeight: 600 }}>DONE ({checked.length})</div>
                    {checked.map(item => (
                      <div key={item.id}
                        style={{ background: '#0D150D', borderRadius: 10, padding: '10px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, opacity: 0.6 }}>
                        <button onClick={() => toggleItem(item.id)}
                          style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: ACCENT, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={13} color="#fff" />
                        </button>
                        <div style={{ flex: 1, textDecoration: 'line-through', fontSize: 14, color: '#555' }}>{item.name}</div>
                        <button onClick={() => deleteItem(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 4 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {unchecked.length === 0 && checked.length === 0 && !showAdd && (
                  <div style={{ textAlign: 'center', color: '#444', padding: '30px 0', fontSize: 14 }}>
                    List is empty — add items below
                  </div>
                )}

                {/* Add Item */}
                {showAdd ? (
                  <div style={{ background: '#111811', borderRadius: 16, padding: 18, marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>Add Item</span>
                      <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={16} /></button>
                    </div>
                    {/* Quick add */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>Quick Add</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {QUICK_ITEMS.slice(0, 8).map(qi => (
                          <button key={qi.name} onClick={() => { quickAdd(qi); setShowAdd(false) }}
                            style={{ background: '#1A2A1A', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#ccc', fontSize: 12, cursor: 'pointer' }}>
                            {qi.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #1A2A1A', paddingTop: 12 }}>
                      <input placeholder="Item name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        style={{ width: '100%', background: '#1A2A1A', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <input placeholder="Qty (e.g. 500g)" value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))}
                          style={{ background: '#1A2A1A', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14 }} />
                        <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                          style={{ background: '#1A2A1A', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14 }}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <input placeholder="Note (optional)" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                        style={{ width: '100%', background: '#1A2A1A', border: 'none', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
                      <button onClick={addItem}
                        style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 10, padding: '12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                        Add to List
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAdd(true)}
                    style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                    <Plus size={18} /> Add Item
                  </button>
                )}
              </>
            )}
          </>
        )}

        {tab === 'lists' && (
          <>
            {lists.map(list => {
              const done = list.items.filter(i => i.checked).length
              return (
                <div key={list.id}
                  style={{ background: '#111811', borderRadius: 12, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, border: activeId === list.id ? `1px solid ${ACCENT}` : '1px solid transparent', cursor: 'pointer' }}
                  onClick={() => { setActiveId(list.id); setTab('list') }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: ACCENT + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShoppingCart size={18} color={ACCENT} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{list.name}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{list.items.length} items · {done} done · {list.created}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteList(list.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
            {lists.length === 0 && <div style={{ textAlign: 'center', color: '#555', padding: '40px 0', fontSize: 14 }}>No lists yet</div>}

            {showNewList ? (
              <div style={{ background: '#111811', borderRadius: 16, padding: 18, marginTop: 12 }}>
                <input placeholder="List name (e.g. Weekly Shop)" value={newListName} onChange={e => setNewListName(e.target.value)}
                  style={{ width: '100%', background: '#1A2A1A', border: 'none', borderRadius: 8, padding: '12px', color: '#F5F5F5', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowNewList(false)}
                    style={{ flex: 1, background: '#1A2A1A', border: 'none', borderRadius: 10, padding: '11px', color: '#888', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={createList}
                    style={{ flex: 1, background: ACCENT, border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Create</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewList(true)}
                style={{ width: '100%', background: ACCENT, border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                <Plus size={18} /> New List
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
