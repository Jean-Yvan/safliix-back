# Synthèse des endpoints backend à prévoir
Vue d'ensemble des appels API nécessaires par page. Les schémas de payload sont indicatifs (JSON). Les identifiants de contenu utilisent `id` (string ou number) et `type` ∈ `film | serie`.

## Onboarding (/onboarding)
- `GET /auth/me` → retourne `{ id, email, displayName, roles, subscriptionStatus }` si le cookie de session est valide, 401 sinon. Permet de rediriger l’utilisateur vers `/home` ou `/discovery`.

## Discovery (/discovery) & Auth (/auth)
- `POST /auth/login`  
  - Body: `{ email: string, password: string }`  
  - Response: `{ token | sessionCookie, user: { id, email, displayName, roles } }`  
  - Description: authentifie l’utilisateur et installe la session.
- `POST /auth/register`  
  - Body: `{ email, password, passwordConfirmation? }`  
  - Response: `{ user: { id, email, displayName }, token | sessionCookie }`  
  - Description: crée un compte puis connecte l’utilisateur.
- (option) `POST /auth/logout` → invalide la session quand l’utilisateur se déconnecte (Paramètres/Profil).

## Inscription (/inscription)
- Réutilise `POST /auth/register` (voir ci-dessus).

## Réinitialisation mot de passe (/reset-password*)
- `POST /auth/password-reset/request`  
  - Body: `{ email }`  
  - Response: `{ message, channel: "email", expiresInSeconds }`  
  - Description: envoie le code PIN.
- `POST /auth/password-reset/verify`  
  - Body: `{ email, code }`  
  - Response: `{ valid: boolean, token: string }` (token éphémère pour le reset).  
  - Description: vérifie le code reçu sur /reset-password/pin.
- `POST /auth/password-reset/confirm`  
  - Body: `{ token, newPassword }`  
  - Response: `{ message }`  
  - Description: enregistre le nouveau mot de passe sur /reset-password/new.

## Subscription (/subscription) & Checkout (/checkout)
- `GET /plans` → liste des offres `{ id, title, price, currency, billingCycle, perks[], type: "subscription" | "location" }`.
- `POST /checkout/intent`  
  - Body: `{ planId, planType: "subscription" | "location", target: "me" | "friend", friend: { email?: string, accountId?: string }, paymentMethod: "card" | "fedapay" | "mobile_money" }`  
  - Response: `{ intentId, amount, currency, paymentUrl?, status: "pending" }`  
  - Description: prépare le paiement à l’étape finale du flow.
- `POST /checkout/confirm`  
  - Body: `{ intentId, paymentResult: { status, providerRef } }`  
  - Response: `{ status: "paid" | "failed", subscriptionId?, rentalId? }`  
  - Description: clôture le flow après retour du PSP.

## Home (/home), Films (/films), Séries (/series), Location (/dashboard/location)
- `GET /catalog/sections`  
  - Query: `type=film|serie|all`  
  - Response: `{ sections: { key, title, items: VideoItem[] }[] }`  
  - Description: alimente les blocs Recommandés, Tendances, IMDb Top, etc.
- `GET /search`  
  - Query: `q, type?, genre?, badge?`  
  - Response: `{ items: VideoItem[] }`  
  - Description: utilisé par la recherche locale/online du layout.
- `POST /interactions/favorite`  
  - Body: `{ id, type, title, image }`  
  - Response: `{ isFavorite: boolean }`  
  - Description: ajoute ou retire un favori depuis les cartes.
- `POST /interactions/view`  
  - Body: `{ id, type, context: "card" | "detail", timestamp? }`  
  - Response: `{ logged: true }`  
  - Description: journalise les vues (Home + page détail).

## Détail contenu (/dashboard/film/detail)
- `GET /contents/{id}` → `{ id, type, title, synopsis, duration, genres[], tags[], poster, country, audio, availableFor }`.
- `GET /contents/{id}/episodes` (si `type=serie`) → `{ episodes: { id, title, duration, synopsis, image, season, number }[] }`.
- `GET /contents/{id}/recommendations` → `{ items: VideoItem[] }`.
- `GET /contents/{id}/reviews` → `{ reviews: { id, author, rating, content, createdAt, status: "published" | "spoiler" }[] }`.
- `POST /contents/{id}/reviews`  
  - Body: `{ rating: 1-5, content: string, anonymous?: boolean }`  
  - Response: `{ id, status: "published" | "pending" }`.

## Mes locations (/dashboard/locations)
- `GET /users/me/rentals`  
  - Query: `status=active|expired|all`  
  - Response: `{ rentals: { id, title, image, expiresAt, rating, quality, status }[] }`  
  - Description: remplit les sections "Location en cours / expirée".

## Paramètre (/dashboard/settings)
- `GET /users/me` → `{ id, firstName, lastName, email, phone, country, avatar, roles }`.
- `PUT /users/me`  
  - Body: `{ firstName?, lastName?, email?, phone?, country?, password? }`  
  - Response: `{ user: {...updatedFields} }`.
- `GET /users/me/subscriptions` → `{ history: { date, action, target, mode, status, type, currency, cost, tax, total }[] }`.
- `GET /users/me/rentals/history` → `{ history: { date, action, film, target, mode, status, currency, cost, tax, total }[] }`.
- (reuse) `POST /auth/logout` pour le bouton Déconnexion.
