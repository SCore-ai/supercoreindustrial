# Şunu da güncelle: Products folder vs CategoriesSupercore Industrial Systems Ltd — Master Categories

**Version:** 1.7  
**Last updated:** 2 September 2026  
**Revision:** Products folder vs Categories — leaf folders on disk, Medusa assignment depth 1  
**Backend source:** `apps/backend/src/lib/seed/supercore-category-tree.ts`  
**Sync script:** `apps/backend/src/scripts/backfill-supercore-categories.ts`

---

## Products (Medusa catalog)

**Browse:** `/store` · **Pages:** `/categories/{handle}` (nested paths supported)  
**Total seeded handles:** 88 (14 roots + children)

### Products folder vs Categories


| Layer                       | Where                                         | Depth                                                   |
| --------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| **Medusa category tree**    | DB + storefront browse                        | Up to 3 levels (root → parent → leaf)                   |
| **Website product folders** | `apps/backend/data/website sources/Products/` | Products only on **leaf** paths                         |
| **Medusa product link**     | Assigned category on each product             | **Max depth 1** today (`medusa-category-assignment.ts`) |


Example — Axis weathershield: folder `explosion-protected-devices/ex-accessories/ex-mounts/{slug}/`, `product.json` handle `ex-mounts`, Medusa assignment `ex-accessories`. Full rules: `Products/_mapping/category-mapping.md`.

### Root categories (14)


| #   | Name                        | Handle                        |
| --- | --------------------------- | ----------------------------- |
| 1   | CCTV Systems                | `cctv-systems`                |
| 2   | PAGA Systems                | `paga-systems`                |
| 3   | Intercom Systems            | `intercom-systems`            |
| 4   | Public Address Systems      | `public-address-systems`      |
| 5   | Solution Platforms          | `solution-platforms`          |
| 6   | Explosion-Protected Devices | `explosion-protected-devices` |
| 7   | Network audio               | `network-audio`               |
| 8   | Access control              | `access-control`              |
| 9   | Radar                       | `radar`                       |
| 10  | Video analytics             | `video-analytics`             |
| 11  | Hazardous Area              | `hazardous-area`              |
| 12  | Safe Area                   | `safe-area`                   |
| 13  | Cables                      | `cables`                      |
| 14  | Legacy Devices              | `legacy-devices`              |


---



### CCTV Systems (`cctv-systems`)


| Name                  | Handle                     |
| --------------------- | -------------------------- |
| Box                   | `cctv-box`                 |
| Bullet                | `cctv-bullet`              |
| Dome                  | `cctv-dome`                |
| PTZ                   | `cctv-ptz`                 |
| Panoramic             | `cctv-panoramic`           |
| Positioning           | `cctv-positioning`         |
| Special Cameras       | `cctv-special`             |
| Thermal Imaging       | `cctv-thermal`             |
| Explosion-Protected   | `cctv-explosion-protected` |
| Accessories           | `cctv-accessories`         |
| Storage and Recorders | `cctv-storage`             |
| Software              | `cctv-software`            |




### PAGA Systems (`paga-systems`)


| Name                     | Handle        |
| ------------------------ | ------------- |
| EXIGO Networked IP PA/GA | `paga-exigo`  |
| SPA-V2 PA/GA             | `paga-spa-v2` |




### Intercom Systems (`intercom-systems`)


| Name                  | Handle                  |
| --------------------- | ----------------------- |
| IC-EDGE System        | `intercom-ic-edge`      |
| ICX-AlphaCom Platform | `intercom-icx-alphacom` |
| ICS 6200 System       | `intercom-ics-6200`     |
| Batteryless Telephone | `intercom-batteryless`  |
| IP and SIP Intercom   | `intercom-ip-sip`       |




### Public Address Systems (`public-address-systems`)


| Name                       | Handle              |
| -------------------------- | ------------------- |
| ZENITEL PAVA Systems       | `pa-pava`           |
| INTEGRA Range (Wall Mount) | `pa-integra`        |
| VIPEDIA Range (Rack Mount) | `pa-vipedia`        |
| Zenitel VAIA Range         | `pa-vaia`           |
| SIP Amplifiers             | `pa-sip-amplifiers` |
| IP Speakers                | `pa-ip-speakers`    |
| Loudspeakers               | `pa-loudspeakers`   |




### Solution Platforms (`solution-platforms`)


| Name                | Handle                  |
| ------------------- | ----------------------- |
| Zenitel Connect Pro | `platform-connect-pro`  |
| IC-EDGE System      | `platform-ic-edge`      |
| ICX-AlphaCom        | `platform-icx-alphacom` |




### Explosion-Protected Devices (`explosion-protected-devices`)

**Accessories for Hazardous Areas** (`ex-accessories`)


| Name                                       | Handle                  |
| ------------------------------------------ | ----------------------- |
| Housings and Cabinets for Hazardous Areas  | `ex-housings-cabinets`  |
| Mounts for Hazardous Areas                 | `ex-mounts`             |
| Power and Connectivity for Hazardous Areas | `ex-power-connectivity` |
| Tools and Extras for Hazardous Areas       | `ex-tools`              |


**Explosion-Protected Cameras** (`ex-cameras`)


| Name                                                             | Handle             |
| ---------------------------------------------------------------- | ------------------ |
| Explosion Protected Cameras Certified Zone 1 and-or Division 1   | `ex-zone1-cameras` |
| Explosion Protected Fixed Camera Certified Zone 2 and Division 2 | `ex-zone2-cameras` |
| Explosion Protected Dome Cameras                                 | `ex-dome-cameras`  |
| Explosion Protected Fixed Cameras                                | `ex-fixed-cameras` |
| Thermal imaging                                                  | `ex-thermal`       |




### Radar (`radar`)


| Name                                 | Handle                        |
| ------------------------------------ | ----------------------------- |
| Security Radars                      | `radar-security`              |
| HDR 300 Series                       | `radar-hdr-300`               |
| HDR 351 Radar                        | `radar-hdr-351`               |
| AdvanceGuard for Airports            | `radar-advanceguard-airports` |
| AdvanceGuard for FOD                 | `radar-advanceguard-fod`      |
| AdvanceGuard for Ground Surveillance | `radar-advanceguard-ground`   |
| AdvanceGuard for Security            | `radar-advanceguard-security` |
| ClearWay                             | `radar-clearway`              |
| SafeGuard                            | `radar-safeguard`             |
| Sensors                              | `radar-sensors`               |




### Hazardous Area (`hazardous-area`)


| Name                                          | Handle               |
| --------------------------------------------- | -------------------- |
| Hazardous Area Fixed Camera Housing           | `haz-fixed-housing`  |
| Hazardous Area Fixed Camera Stations          | `haz-fixed-stations` |
| Hazardous Area Illuminators                   | `haz-illuminators`   |
| Hazardous Area Pan & Tilt                     | `haz-pan-tilt`       |
| Hazardous Area PTZ Camera Housing             | `haz-ptz-housing`    |
| Hazardous Area PTZ Camera Stations            | `haz-ptz-stations`   |
| Hazardous Area Washer Systems and Accessories | `haz-washer-systems` |




### Safe Area (`safe-area`)


| Name                                     | Handle                |
| ---------------------------------------- | --------------------- |
| Safe Area Fixed Camera Housing           | `safe-fixed-housing`  |
| Safe Area Fixed Camera Stations          | `safe-fixed-stations` |
| Safe Area Illuminators                   | `safe-illuminators`   |
| Safe Area Pan & Tilt                     | `safe-pan-tilt`       |
| Safe Area PTZ Camera Housing             | `safe-ptz-housing`    |
| Safe Area PTZ Camera Stations            | `safe-ptz-stations`   |
| Safe Area Washer Systems and Accessories | `safe-washer-systems` |




### Cables (`cables`)


| Name                                        | Handle                   |
| ------------------------------------------- | ------------------------ |
| NEK Sealine Marine Cables                   | `cables-nek-sealine`     |
| DNV-GL and Lloyd's Register Approved Cables | `cables-dnv-lloyds`      |
| NEK 606 Cables                              | `cables-nek-606`         |
| BS6883 / BS7917 UKOOA Cables                | `cables-bs6883`          |
| Amercable Gexol Type P Cables               | `cables-amercable-gexol` |
| Bespoke Design / Hybrid Cables              | `cables-bespoke-hybrid`  |
| Marine Cables                               | `cables-marine`          |
| Fibre Optic Cables                          | `cables-fibre`           |
| Data / Admiral Cables                       | `cables-data-admiral`    |
| Pre-Term Fibre Optic Assemblies             | `cables-preterm-fibre`   |




### Legacy Devices (`legacy-devices`)

Leaf root for manufacturer **end-of-life** products. Search still finds them; the product page shows a **Successor** card when `successor_handle` is set.

`product.json` fields:

```json
{
  "lifecycle": "eol",
  "successor_handle": "axis-q6318-le",
  "original_category_handle": "cctv-ptz"
}
```

Folder layout: `Products/legacy-devices/{slug}/`. Sync keeps anything already in this folder (or marked `lifecycle: "eol"`) here instead of remapping it to a live category. Not shown in the Products mega-menu; browse at `/categories/legacy-devices`.

Copy `lifecycle` and `successor_handle` onto the Medusa product **metadata** so the storefront successor block can read them.

---



## Engineering · Markets · Company

See `NAVIGATION-MENU.md` §2.2 (Engineering Services, Connectivity, Markets We Serve) and §2.4 (Company).

---



## Sync to Medusa

```powershell
docker compose exec medusa sh -c "cd /server/apps/backend && pnpm exec medusa exec ./src/scripts/backfill-supercore-categories.ts"
```

Creates missing categories by handle. Safe to re-run after taxonomy revisions.

---

*Supercore Industrial Systems Ltd — Master Categories v1.7*