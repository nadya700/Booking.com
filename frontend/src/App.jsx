import { useEffect, useMemo, useState } from 'react'
import './App.css'

const initialPropertyForm = {
  title: '',
  location: '',
  type: 'Hotel',
  image_url: '',
  stars: 4,
  rating: 8.5,
  reviews_count: 0,
  price_per_night: 120,
  max_guests: 2,
  free_cancellation: true,
  description: '',
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [properties, setProperties] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [bookings, setBookings] = useState([])
  const [availability, setAvailability] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [propertyForm, setPropertyForm] = useState(initialPropertyForm)
  const [propertyImageFile, setPropertyImageFile] = useState(null)
  const [editingPropertyId, setEditingPropertyId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    guests: 2,
    min_price: '',
    max_price: '',
  })
  const [bookingForm, setBookingForm] = useState({
    guest_name: '',
    guest_email: '',
    check_in: '',
    check_out: '',
    guests: 2,
  })

  const apiRequest = async (url, options = {}) => {
    const hasFormData = options.body instanceof FormData
    const headers = {
      ...(hasFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(url, { ...options, headers })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      const firstError = payload.message || Object.values(payload.errors || {})[0]?.[0]
      throw new Error(firstError || 'Request failed')
    }

    return payload
  }

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (String(value).trim() !== '') {
        params.set(key, value)
      }
    })
    return params.toString()
  }, [filters])

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    const loadMe = async () => {
      try {
        const me = await apiRequest('/api/me')
        setUser(me)
      } catch {
        localStorage.removeItem('token')
        setToken('')
      }
    }

    loadMe()
  }, [token])

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/properties?${queryString}`)
        if (!res.ok) throw new Error('Could not load properties')
        const data = await res.json()
        setProperties(data)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [queryString])

  useEffect(() => {
    if (!user || user.role !== 'guest') return

    const loadUserData = async () => {
      try {
        const [favoritesData, bookingsData] = await Promise.all([
          apiRequest('/api/favorites'),
          apiRequest('/api/bookings'),
        ])
        setFavorites(favoritesData)
        setBookings(bookingsData)
      } catch {
        // ignore panel loading errors to keep listing usable
      }
    }

    loadUserData()
  }, [user])

  useEffect(() => {
    if (!user || user.role !== 'admin') return

    const loadAnalytics = async () => {
      try {
        const payload = await apiRequest('/api/admin/analytics')
        setAnalytics(payload)
      } catch {
        // keep UI responsive even if analytics temporarily fails
      }
    }

    loadAnalytics()
  }, [user])

  const selectProperty = (property) => {
    setSelectedProperty(property)
    setBookingForm((prev) => ({
      ...prev,
      guests: Math.min(prev.guests, property.max_guests),
    }))
    setSuccess('')
    setError('')
  }

  useEffect(() => {
    if (!selectedProperty) {
      setAvailability([])
      return
    }

    const fetchAvailability = async () => {
      setAvailabilityLoading(true)
      try {
        const payload = await apiRequest(`/api/properties/${selectedProperty.id}/availability`)
        setAvailability(payload.days || [])
      } catch {
        setAvailability([])
      } finally {
        setAvailabilityLoading(false)
      }
    }

    fetchAvailability()
  }, [selectedProperty])

  const handleBooking = async (event) => {
    event.preventDefault()

    if (!selectedProperty) return

    setError('')
    setSuccess('')

    try {
      const payload = await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          ...bookingForm,
          guests: Number(bookingForm.guests),
          property_id: selectedProperty.id,
        }),
      })

      setSuccess(
        `Booking confirmed for ${payload.property.title}. Total: $${payload.total_price}`
      )
      const newBookings = await apiRequest('/api/bookings')
      setBookings(newBookings)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const endpoint = authMode === 'register' ? '/api/register' : '/api/login'
      const payload = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(authForm),
      })

      localStorage.setItem('token', payload.token)
      setToken(payload.token)
      setUser(payload.user)
      setSuccess(`Welcome, ${payload.user.name}`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleLogout = async () => {
    try {
      await apiRequest('/api/logout', { method: 'POST' })
    } catch {
      // logout should continue even if token already invalid
    }
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
    setFavorites([])
    setBookings([])
  }

  const favoriteIds = new Set(favorites.map((item) => item.property_id))

  const toggleFavorite = async (propertyId) => {
    if (!user || user.role !== 'guest') return

    try {
      if (favoriteIds.has(propertyId)) {
        await apiRequest(`/api/favorites/${propertyId}`, { method: 'DELETE' })
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ property_id: propertyId }),
        })
      }
      const updated = await apiRequest('/api/favorites')
      setFavorites(updated)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const startEditProperty = (property) => {
    setEditingPropertyId(property.id)
    setPropertyForm({
      ...property,
    })
  }

  const resetAdminForm = () => {
    setEditingPropertyId(null)
    setPropertyForm(initialPropertyForm)
    setPropertyImageFile(null)
  }

  const submitProperty = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const method = editingPropertyId ? 'PUT' : 'POST'
    const endpoint = editingPropertyId
      ? `/api/properties/${editingPropertyId}`
      : '/api/properties'

    try {
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          ...propertyForm,
          stars: Number(propertyForm.stars),
          rating: Number(propertyForm.rating),
          reviews_count: Number(propertyForm.reviews_count),
          price_per_night: Number(propertyForm.price_per_night),
          max_guests: Number(propertyForm.max_guests),
          free_cancellation: Boolean(propertyForm.free_cancellation),
        }),
      })
      setSuccess(editingPropertyId ? 'Property updated.' : 'Property created.')
      resetAdminForm()
      const refreshed = await apiRequest(`/api/properties?${queryString}`)
      setProperties(refreshed)
      if (user?.role === 'admin') {
        const payload = await apiRequest('/api/admin/analytics')
        setAnalytics(payload)
      }
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const uploadPropertyImage = async () => {
    if (!editingPropertyId || !propertyImageFile) return

    const formData = new FormData()
    formData.append('image', propertyImageFile)

    try {
      await apiRequest(`/api/properties/${editingPropertyId}/image`, {
        method: 'POST',
        body: formData,
      })
      setSuccess('Property image uploaded.')
      const refreshed = await apiRequest(`/api/properties?${queryString}`)
      setProperties(refreshed)
      setPropertyImageFile(null)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const deleteProperty = async (propertyId) => {
    try {
      await apiRequest(`/api/properties/${propertyId}`, { method: 'DELETE' })
      setProperties((prev) => prev.filter((p) => p.id !== propertyId))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">Hotels - homes - apartments</p>
          <h1>Find your next stay</h1>
          <p className="subtitle">
            Search deals inspired by Booking.com and reserve through Laravel API.
          </p>
          <div className="top-actions">
            {!user ? (
              <span>Register as guest to book and favorite rooms</span>
            ) : (
              <span>
                Signed in as {user.name} ({user.role})
              </span>
            )}
            {user && <button onClick={handleLogout}>Logout</button>}
          </div>

          <div className="search-bar">
            <input
              placeholder="Where are you going?"
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            />
            <input
              type="number"
              min="1"
              value={filters.guests}
              onChange={(e) => setFilters((prev) => ({ ...prev, guests: e.target.value }))}
              placeholder="Guests"
            />
            <input
              type="number"
              min="0"
              value={filters.min_price}
              onChange={(e) => setFilters((prev) => ({ ...prev, min_price: e.target.value }))}
              placeholder="Min $"
            />
            <input
              type="number"
              min="0"
              value={filters.max_price}
              onChange={(e) => setFilters((prev) => ({ ...prev, max_price: e.target.value }))}
              placeholder="Max $"
            />
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="results">
          {loading && <p>Loading stays...</p>}
          {error && <p className="status error">{error}</p>}
          {!loading && properties.length === 0 && <p>No properties match your search.</p>}

          {properties.map((property) => (
            <article
              key={property.id}
              className={`card ${selectedProperty?.id === property.id ? 'active' : ''}`}
              onClick={() => selectProperty(property)}
            >
              <img src={property.image_url} alt={property.title} />
              <div className="card-body">
                <h3>{property.title}</h3>
                <p className="meta">
                  {property.type} - {property.location}
                </p>
                <p>{property.description}</p>
                <div className="row">
                  <span>{'★'.repeat(property.stars)}</span>
                  <strong>${property.price_per_night}/night</strong>
                </div>
                <small>
                  Rating {property.rating} ({property.reviews_count} reviews)
                </small>
                {user?.role === 'guest' && (
                  <button
                    className="favorite-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(property.id)
                    }}
                  >
                    {favoriteIds.has(property.id) ? 'Remove favorite' : 'Add to favorites'}
                  </button>
                )}
                {user?.role === 'admin' && (
                  <div className="admin-actions">
                    <button onClick={(e) => { e.stopPropagation(); startEditProperty(property) }}>
                      Edit
                    </button>
                    <button
                      className="danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProperty(property.id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        <aside className="sidebar">
          {!user && (
            <>
              <h2>Login / Register</h2>
              <form onSubmit={handleAuthSubmit} className="booking-form">
                {authMode === 'register' && (
                  <input
                    required
                    placeholder="Name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                )}
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                />
                <input
                  required
                  type="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
                <button type="submit">
                  {authMode === 'register' ? 'Create guest account' : 'Login'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))}
                >
                  Switch to {authMode === 'login' ? 'register' : 'login'}
                </button>
              </form>
              <p className="hint">Admin accounts are controlled by backend seeders/admins.</p>
            </>
          )}

          {user?.role === 'guest' && (
            <>
              <h2>Reserve your stay</h2>
              {!selectedProperty && <p>Select a property to continue.</p>}

              {selectedProperty && (
                <>
                  <div className="selected">
                    <strong>{selectedProperty.title}</strong>
                    <p>
                      {selectedProperty.location} - Up to {selectedProperty.max_guests} guests
                    </p>
                  </div>

                  <form onSubmit={handleBooking} className="booking-form">
                    <input
                      required
                      placeholder="Full name"
                      value={bookingForm.guest_name}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, guest_name: e.target.value }))
                      }
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email"
                      value={bookingForm.guest_email}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, guest_email: e.target.value }))
                      }
                    />
                    <label>
                      Check-in
                      <input
                        required
                        type="date"
                        value={bookingForm.check_in}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, check_in: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Check-out
                      <input
                        required
                        type="date"
                        value={bookingForm.check_out}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, check_out: e.target.value }))
                        }
                      />
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      max={selectedProperty.max_guests}
                      value={bookingForm.guests}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, guests: e.target.value }))
                      }
                    />
                    <button type="submit">Book now</button>
                  </form>
                  <h3>Availability (next 30 days)</h3>
                  {availabilityLoading ? (
                    <p>Loading availability...</p>
                  ) : (
                    <div className="availability-grid">
                      {availability.map((day) => (
                        <span
                          key={day.date}
                          className={`day-pill ${day.available ? 'free' : 'booked'}`}
                          title={day.date}
                        >
                          {day.date.slice(5)}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
              <h3>Your favorites</h3>
              <ul className="compact-list">
                {favorites.map((item) => (
                  <li key={item.id}>{item.property?.title}</li>
                ))}
              </ul>
              <h3>Your bookings</h3>
              <ul className="compact-list">
                {bookings.map((item) => (
                  <li key={item.id}>
                    {item.property?.title} ({item.check_in} to {item.check_out})
                  </li>
                ))}
              </ul>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <h2>Admin panel: manage rooms</h2>
              {analytics && (
                <div className="admin-kpis">
                  <p>Properties: {analytics.total_properties}</p>
                  <p>Bookings: {analytics.total_bookings}</p>
                  <p>Revenue: ${analytics.confirmed_revenue}</p>
                  <p>Active guests: {analytics.active_guests}</p>
                </div>
              )}
              <form onSubmit={submitProperty} className="booking-form">
                <input
                  required
                  placeholder="Title"
                  value={propertyForm.title}
                  onChange={(e) => setPropertyForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <input
                  required
                  placeholder="Location"
                  value={propertyForm.location}
                  onChange={(e) =>
                    setPropertyForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
                <input
                  required
                  placeholder="Image URL"
                  value={propertyForm.image_url}
                  onChange={(e) =>
                    setPropertyForm((prev) => ({ ...prev, image_url: e.target.value }))
                  }
                />
                <textarea
                  required
                  placeholder="Description"
                  value={propertyForm.description}
                  onChange={(e) =>
                    setPropertyForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={propertyForm.stars}
                  onChange={(e) => setPropertyForm((prev) => ({ ...prev, stars: e.target.value }))}
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={propertyForm.rating}
                  onChange={(e) => setPropertyForm((prev) => ({ ...prev, rating: e.target.value }))}
                />
                <input
                  type="number"
                  min="1"
                  value={propertyForm.price_per_night}
                  onChange={(e) =>
                    setPropertyForm((prev) => ({ ...prev, price_per_night: e.target.value }))
                  }
                />
                <input
                  type="number"
                  min="1"
                  value={propertyForm.max_guests}
                  onChange={(e) =>
                    setPropertyForm((prev) => ({ ...prev, max_guests: e.target.value }))
                  }
                />
                <button type="submit">{editingPropertyId ? 'Update room' : 'Create room'}</button>
                {editingPropertyId && (
                  <button type="button" className="secondary" onClick={resetAdminForm}>
                    Cancel edit
                  </button>
                )}
              </form>
              {editingPropertyId && (
                <div className="booking-form">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPropertyImageFile(e.target.files?.[0] || null)}
                  />
                  <button
                    type="button"
                    className="secondary"
                    onClick={uploadPropertyImage}
                    disabled={!propertyImageFile}
                  >
                    Upload selected image
                  </button>
                </div>
              )}
              {analytics?.top_properties?.length > 0 && (
                <>
                  <h3>Top booked properties</h3>
                  <ul className="compact-list">
                    {analytics.top_properties.map((item) => (
                      <li key={item.id}>
                        {item.title} ({item.bookings_count} bookings)
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          {success && <p className="status success">{success}</p>}
          {error && <p className="status error">{error}</p>}
        </aside>
      </main>
    </div>
  )
}

export default App
