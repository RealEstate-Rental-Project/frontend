# Frontend

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve public-app
```

To create a production bundle:

```sh
npx nx build public-app
```

To see all available targets to run for a project, run:

```sh
npx nx show project public-app
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/angular:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/angular:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

---


# Documentation API — Search et récupération complète des propriétés

Ce document explique au(e) développeur(se) frontend comment :
- effectuer une recherche de propriétés (par city, type, fourchette de prix, latitude/longitude + rayon),
- récupérer "my-properties" (les propriétés de l'utilisateur authentifié),
- récupérer pour chaque propriété ses rooms et les images de chaque room pour afficher la fiche complète.

Tous les endpoints sont préfixés par :
`/api/property-microservice`

Authentification
- La plupart des endpoints privés nécessitent un header Authorization: `Bearer <jwt>`.
- Le backend extrait l'utilisateur authentifié via `@AuthenticationPrincipal`.

Résumé des endpoints importants

1) Recherche de propriétés
- POST /api/property-microservice/properties/search
  - Content-Type: application/json
  - Body (PropertySearchDTO) :
    {
      "city": "string",                  // facultatif
      "minRentAmount": 100,               // facultatif (nombre)
      "maxRentAmount": 1000,              // facultatif (nombre)
      "typeOfRental": "SHORT_TERM|LONG_TERM|...", // facultatif (enum)
      "latitude": 48.8566,                // facultatif (double)
      "longitude": 2.3522,                // facultatif (double)
      "radiusInKm": 5.0                   // facultatif (double) — défaut 5.0
    }
  - Response: 200 OK
    - Liste d'entités `Property` (le contrôleur renvoie `List<Property>` pour la recherche).
    - Remarque : les autres endpoints (GET `/properties` ou GET `/properties/{id}`) renvoient des `PropertyResponseDTO`.

Remarques sur la recherche géospatiale
- Si vous fournissez `latitude` + `longitude`, le service utilisera `radiusInKm` pour filtrer les propriétés à l'intérieur de ce rayon (par défaut 5 km).
- Si vous spécifiez seulement `city`, la recherche filtre par ville.
- Combinez filtres (city + price range + type + geo) selon l'UX souhaitée.

2) Liste publique et single property
- GET /api/property-microservice/properties
  - Renvoie `List<PropertyResponseDTO>` (champs principaux de la propriété).
- GET /api/property-microservice/properties/{id}
  - Renvoie `PropertyResponseDTO`

Structure `PropertyResponseDTO`
- idProperty (Long)
- onChainId (Long)
- title (String)
- country (String)
- city (String)
- address (String)
- longitude (Double)
- latitude (Double)
- description (String)
- typeOfRental (enum)
- rentAmount (Long)
- securityDeposit (Long)
- isAvailable (Boolean)
- isActive (Boolean)
- ownerId (Long)
- ownerEthAddress (String)
- createdAt (LocalDateTime)
- updatedAt (LocalDateTime)

Important : `PropertyResponseDTO` ne contient PAS les rooms ni les images — il faut effectuer des appels supplémentaires pour récupérer ces données.

3) Récupérer les propriétés de l'utilisateur (my-properties)
- GET /api/property-microservice/properties/my-properties
  - Auth required (Bearer JWT)
  - Response: 200 OK
    - `List<PropertyResponseDTO>` correspondant aux propriétés dont `ownerId` == utilisateur courant

4) Récupérer les rooms d'une propriété
- GET /api/property-microservice/rooms/property/{propertyId}
  - Response: 200 OK
    - `List<RoomResponseDTO>`

Structure `RoomResponseDTO`
- idRoom (Long)
- name (String)
- orderIndex (Integer)
- propertyId (Long)

5) Récupérer les images d'une room
- GET /api/property-microservice/properties/room-images/room/{roomId}
  - Response: 200 OK
    - `List<RoomImageResponseDTO>`

Structure `RoomImageResponseDTO`
- idImage (Long)
- url (String)      // URL publique accessible pour afficher l'image
- s3Key (String)    // clé interne de stockage (S3)
- orderIndex (Integer)
- roomId (Long)

Flux recommandé pour récupérer une propriété "complète" (property + rooms + images)

Étapes (séquentielles mais parallélisables):
1. Appeler `GET /api/property-microservice/properties` ou `GET /api/property-microservice/properties/my-properties` selon le cas (liste de `PropertyResponseDTO`).
2. Pour chaque propriété retournée :
   a) Appeler `GET /api/property-microservice/rooms/property/{propertyId}` pour récupérer les rooms associées.
   b) Pour chaque room retournée, appeler `GET /api/property-microservice/properties/room-images/room/{roomId}` pour récupérer les images (utiliser `url` pour l'affichage).

Conseils de performance pour le frontend
- Paralléliser les appels : utilisez Promise.all pour récupérer rooms pour plusieurs propriétés en parallèle, puis pour chaque room récupérer les images en parallèle.
- Paginer / limiter : s'il y a beaucoup de propriétés/rooms, limitez le nombre initial (l'API actuelle ne semble pas exposer la pagination — prévoir côté frontend des limites et lazy-loading).
- Caching : mettre en cache les rooms/images par propertyId/roomId pour éviter répétitions lors de navigation.

Exemple JS (fetch + Promise.all) — récupérer "my-properties" complets

async function fetchFullMyProperties(apiBaseUrl, token) {
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 1) Récupérer mes propriétés
  const propsRes = await fetch(`${apiBaseUrl}/properties/my-properties`, { headers });
  if (!propsRes.ok) throw new Error('Failed to fetch my-properties');
  const properties = await propsRes.json(); // array of PropertyResponseDTO

  // 2) Pour chaque propriété récupérer les rooms
  const roomsPromises = properties.map(p => 
    fetch(`${apiBaseUrl}/rooms/property/${p.idProperty}`, { headers }).then(r => {
      if (!r.ok) return [];
      return r.json();
    })
  );

  const roomsPerProperty = await Promise.all(roomsPromises); // array of room arrays

  // 3) Pour chaque room récupérer les images (mettre en parallèle au niveau des rooms)
  const imagesPromisesNested = roomsPerProperty.map(rooms =>
    Promise.all(rooms.map(room =>
      fetch(`${apiBaseUrl}/properties/room-images/room/${room.idRoom}`, { headers })
        .then(r => r.ok ? r.json() : [])
    ))
  );

  const imagesPerProperty = await Promise.all(imagesPromisesNested); // array of arrays of arrays

  // 4) Composer la structure complète
  const fullProperties = properties.map((p, i) => ({
    ...p,
    rooms: roomsPerProperty[i].map((room, j) => ({
      ...room,
      images: imagesPerProperty[i][j] || []
    }))
  }));

  return fullProperties;
}

Exemple cURL (recherche)

curl -X POST "http://localhost:8080/api/property-microservice/properties/search" \
  -H "Content-Type: application/json" \
  -d '{"city":"Paris","minRentAmount":200,"maxRentAmount":1500,"radiusInKm":10}'

Exemple de requête pour récupérer les images d'une room

curl -X GET "http://localhost:8080/api/property-microservice/properties/room-images/room/12"

Bonnes pratiques et points d'attention
- Gestion d'erreurs : vérifier le code HTTP, afficher des messages utilisateur appropriés (404 = ressource manquante, 401/403 = problème d'authentification/autorisation).
- Sécurité : ne jamais exposer le token côté client (utiliser stockage sécurisé et renouveler si nécessaire).
- Données incomplètes : `PropertyResponseDTO` ne contient pas rooms/images — utilisez la procédure ci-dessus pour les compléter.
- Tri & ordre : `orderIndex` sur rooms et images indique l'ordre souhaité d'affichage.
- Images : préférez utiliser le champ `url` du DTO `RoomImageResponseDTO` pour l'affichage (CORS et liens pré-signés si utilisés côté S3).

Cas particuliers & suggestions d'améliorations (à discuter avec l'équipe backend)
- Endpoint unique "property full" : idéalement exposer un endpoint `GET /properties/{id}/full` qui renvoie la propriété + rooms + images en un seul appel (réduction des allers-retours). Si vous pouvez modifier le backend plus tard, c'est une optimisation valable.
- Pagination & filtres côté search
- Support de thumbnails / tailles d'image si volume important

Annexes — résumés des DTOs utilisés

PropertySearchDTO: { city, minRentAmount, maxRentAmount, typeOfRental, latitude, longitude, radiusInKm }
PropertyResponseDTO: { idProperty, onChainId, title, country, city, address, longitude, latitude, description, typeOfRental, rentAmount, securityDeposit, isAvailable, isActive, ownerId, ownerEthAddress, createdAt, updatedAt }
RoomResponseDTO: { idRoom, name, orderIndex, propertyId }
RoomImageResponseDTO: { idImage, url, s3Key, orderIndex, roomId }

---