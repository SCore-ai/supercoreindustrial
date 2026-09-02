import {
  inferManufacturerId,
  mapManufacturerCategory,
} from "../category-mapping"

describe("mapManufacturerCategory", () => {
  it("maps Zenitel Turbine / TCIS to IP SIP intercom", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "zenitel",
      title: "TCIS-1",
      categoryHint: "IP intercom & speakers > Turbine Basic",
    })
    expect(r.handle).toBe("intercom-ip-sip")
    expect(r.skip).toBe(false)
  })

  it("maps Zenitel Exigo to paga-exigo", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "zenitel",
      title: "ECPIR-3P",
      categoryHint: "PAGA & PAVA systems > Exigo Access Panels",
    })
    expect(r.handle).toBe("paga-exigo")
  })

  it("maps Zenitel Vipedia to pa-vipedia", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "zenitel",
      title: "Vipedia mic",
      categoryHint: "PAGA & PAVA systems > Vipedia/VAIA microphones",
    })
    expect(r.handle).toBe("pa-vipedia")
  })

  it("maps Zenitel ICX-510 Connect Pro to the Connect Pro platform", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "zenitel",
        title: "ICX-510 incl Zenitel Connect Pro",
        categoryHint: "Maritime & Energy > MANUALS",
      }).handle
    ).toBe("platform-connect-pro")
  })

  it("skips Zenitel training even when the pricelist category is IPTV", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "zenitel",
      title: "Zenitel Core System training (USA, VIP Dealer, Per person per day)",
      categoryHint: "Maritime & Energy > IPTV.",
    })
    expect(r.skip).toBe(true)
    expect(r.handle).toBeNull()
  })

  it("skips Zenitel travelling / hotel expenses", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "zenitel",
      title: "Travel day",
      categoryHint:
        "Maritime & Energy > TRAVELLING AND HOTEL EXPENSES IS NOT COVERED BY ZENITEL",
    })
    expect(r.skip).toBe(true)
    expect(r.handle).toBeNull()
  })

  it("maps Zenitel EX proof cameras to zone1", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "zenitel",
      title: "EX camera fixed",
      categoryHint: "Maritime & Energy > EX PROOF IP CAMERAS FIXED",
    })
    expect(r.handle).toBe("ex-zone1-cameras")
  })

  it("maps Axis panoramic / PLR dome line to panoramic", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "axis",
      title: "AXIS M3057-PLR Mk II DOME CAMERA",
    })
    expect(r.handle).toBe("cctv-panoramic")
  })

  it("maps Axis classic dome by form-factor digit", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "axis",
      title: "AXIS Q3538-SLVE DOME CAMERA",
    })
    expect(r.handle).toBe("cctv-dome")
  })

  it("maps Axis thermal Q19", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "axis",
      title: "AXIS Q1961-TE 13mm 8.3 fps",
    })
    expect(r.handle).toBe("cctv-thermal")
  })

  it("maps Axis T91 mount to accessories", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "axis",
      title: "AXIS T91F67 POLE MOUNT STAINLESS STEEL",
    })
    expect(r.handle).toBe("cctv-accessories")
  })

  it("maps Axis C-line to network audio", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "axis",
      title: "AXIS C1110-E Black",
    })
    expect(r.handle).toBe("network-audio")
  })

  it("maps Axis Q17 box series and Q18 bullets from axis.com collections", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "axis",
        title: "AXIS Q1715 BLOCK CAMERA",
      }).handle
    ).toBe("cctv-box")
    expect(
      mapManufacturerCategory({
        manufacturerId: "axis",
        title: "AXIS Q1805-LE",
      }).handle
    ).toBe("cctv-bullet")
    expect(
      mapManufacturerCategory({
        manufacturerId: "axis",
        title: "AXIS Q1785-LE",
      }).handle
    ).toBe("cctv-bullet")
  })

  it("maps Zenitel Integra wall-mount PAVA off Vipedia", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "zenitel",
        title: "INTEGRA-03 Integrated Power Amplifier, DSP and Audio Matrix",
        categoryHint: "PAGA & PAVA systems > Vipedia/VAIA",
      }).handle
    ).toBe("pa-integra")
  })

  it("maps Axis P14 bullets and Zone 2 XLE cameras", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "axis",
        title: "AXIS P1468-LE",
      }).handle
    ).toBe("cctv-bullet")
    expect(
      mapManufacturerCategory({
        manufacturerId: "axis",
        title: "AXIS P1468-XLE",
      }).handle
    ).toBe("ex-zone2-cameras")
  })

  it("maps Axis connector kits to accessories, not cameras", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "axis",
        title: "CONN KIT AXIS P1311",
      }).handle
    ).toBe("cctv-accessories")
  })

  it("maps Axis Q16 box cameras to box", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "axis",
        title: "AXIS Q1656",
      }).handle
    ).toBe("cctv-box")
  })

  it("maps Zenitel ELSII IP speakers to pa-ip-speakers", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "zenitel",
        title: "ELSII-10HM IP Horn Speaker",
        categoryHint: "IP Speakers/ELSII-10HM",
      }).handle
    ).toBe("pa-ip-speakers")
  })

  it("maps Zenitel bullet cameras off the CCTV parent", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "zenitel",
        title: "iDS-2CD7A26G0-IZHSY Network WDR IR bullet camera",
        categoryHint: "Maritime & Energy > IP CAMERA",
      }).handle
    ).toBe("cctv-bullet")
  })

  it("maps Axis XFQ to explosion-protected cameras folder (ex-cameras)", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "axis",
      title: "AXIS XFQ1656",
    })
    expect(r.handle).toBe("ex-zone1-cameras")
  })

  it("maps Axis XPQ PTZ to ex-cameras per oil-and-gas", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "axis",
        title: "AXIS XPQ1785 Explosion-Protected PTZ Camera",
      }).handle
    ).toBe("ex-zone1-cameras")
  })

  it("maps Axis weathershield to ex-mounts leaf", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "axis",
        title: "WEATHERSHIELD EXCAM XF",
      }).handle
    ).toBe("ex-mounts")
  })

  it("maps Axis A1210 door controller to access control", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "axis",
      title: "AXIS A1210 Network Door Controller",
    })
    expect(r.handle).toBe("access-control")
  })

  it("maps Axis I8016 intercom", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "axis",
      title: "AXIS I8016-LVE Network Video Intercom",
    })
    expect(r.handle).toBe("intercom-ip-sip")
  })

  it("maps Axis D2110 radar", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "axis",
      title: "AXIS D2110-VE Security Radar",
    })
    expect(r.handle).toBe("radar-security")
  })

  it("maps Spectrum D-Series PTZ to explosion-protected", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "spectrum",
      title: "D401 Explosion-Proof Camera - P5655 E",
      categoryHint: "Dome Cameras",
    })
    expect(r.handle).toBe("cctv-explosion-protected")
    expect(r.skip).toBe(false)
  })

  it("maps Spectrum F-Series to explosion-protected", () => {
    const r = mapManufacturerCategory({
      manufacturerId: "spectrum",
      title: "F201 Explosion-Proof Camera - Q1715",
      categoryHint: "Fixed Cameras",
    })
    expect(r.handle).toBe("cctv-explosion-protected")
  })

  it("maps Spectrum TEZP to explosion-protected and junction boxes to housings", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "spectrum",
        title: "TEZP-405-30 Explosion-Proof Camera",
        categoryHint: "TEZP & FEZB",
      }).handle
    ).toBe("cctv-explosion-protected")
    expect(
      mapManufacturerCategory({
        manufacturerId: "spectrum",
        title: "EXJB-D1-READER-XXXXX",
        categoryHint: "Junction Boxes",
      }).handle
    ).toBe("ex-housings-cabinets")
    expect(
      mapManufacturerCategory({
        manufacturerId: "spectrum",
        title: "0808-R1900-BD - Explosion-Proof Junction Box",
      }).handle
    ).toBe("ex-housings-cabinets")
    expect(
      mapManufacturerCategory({
        manufacturerId: "spectrum",
        title: "SCS-90W-SPL - Explosion-Proof Accessory",
        sku: "SCS-90W-SPL",
      }).handle
    ).toBe("ex-tools")
    expect(
      mapManufacturerCategory({
        manufacturerId: "spectrum",
        title: "T-WM - Explosion-Proof Accessory",
        sku: "T-WM",
      }).handle
    ).toBe("ex-mounts")
  })

  it("maps Zenitel parent-handle rows to leaf categories", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "zenitel",
        title: "9001 Accomodation unit",
        categoryHint: "Maritime & Energy > DIGITAL INTERCOM",
      }).handle
    ).toBe("intercom-batteryless")
    expect(
      mapManufacturerCategory({
        manufacturerId: "zenitel",
        title: "Relay assembly 4 CO 10A",
        categoryHint: "Maritime & Energy > ALARM",
      }).handle
    ).toBe("cctv-accessories")
    expect(
      mapManufacturerCategory({
        manufacturerId: "zenitel",
        title: "SIP station license",
        categoryHint: "Safety & Security > LICENSE",
      }).handle
    ).toBe("intercom-ip-sip")
    expect(
      mapManufacturerCategory({
        manufacturerId: "zenitel",
        title: "1671 19\" Amplifier, 1U, 250W",
      }).handle
    ).toBe("pa-vipedia")
    expect(
      mapManufacturerCategory({
        manufacturerId: "zenitel",
        title: "Indoor antenna for suspended ceilings 450-470 MHz",
        categoryHint: "Maritime & Energy > RADIO",
      }).handle
    ).toBe("cctv-accessories")
  })

  it("maps Tecnovideo hazardous and safe area families", () => {
    expect(
      mapManufacturerCategory({
        manufacturerId: "tecnovideo",
        title: "TXPTV4 Explosionproof PTZ 4K camera",
        categoryHint: "Hazardous Area > PTZ camera stations",
      }).handle
    ).toBe("haz-ptz-stations")
    expect(
      mapManufacturerCategory({
        manufacturerId: "tecnovideo",
        title: "TSPTV2 Stainless steel PTZ 5MP camera",
        categoryHint: "Safe Area > PTZ camera stations",
      }).handle
    ).toBe("safe-ptz-stations")
    expect(
      mapManufacturerCategory({
        manufacturerId: "tecnovideo",
        title: "EX129 Fixed housing",
        categoryHint: "Hazardous Area > Fixed camera housing",
      }).handle
    ).toBe("haz-fixed-housing")
  })

  it("infers manufacturer from handle", () => {
    expect(inferManufacturerId({ handle: "zenitel-1008111010" })).toBe(
      "zenitel"
    )
    expect(inferManufacturerId({ handle: "axis-02462-001" })).toBe("axis")
    expect(inferManufacturerId({ handle: "spectrum-f201-a-q1715" })).toBe(
      "spectrum"
    )
    expect(inferManufacturerId({ handle: "tecnovideo-tv-cam-01" })).toBe(
      "tecnovideo"
    )
    expect(inferManufacturerId({ handle: "cisco-c9200-24p" })).toBe("cisco")
    expect(inferManufacturerId({ handle: "axis-q6318-le" })).toBe("axis")
    expect(inferManufacturerId({ handle: "zenitel-tcis-1" })).toBe("zenitel")
    expect(
      inferManufacturerId({
        manufacturerId: "spectrum",
        handle: "tezp-405-30-explosion-proof-camera",
      })
    ).toBe("spectrum")
    expect(
      inferManufacturerId({
        manufacturerId: "tecnovideo",
        handle: "txptv4-ptz-camera-station",
      })
    ).toBe("tecnovideo")
  })
})
