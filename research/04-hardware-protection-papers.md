# Research Papers: Hardware-Based Software Protection, RASP & Moving Target Defense

> **Agent:** Hardware Protection Researcher | **Papers Found:** 23

---

## Category 1: Hardware Dongle, Smart Card & Physical Token

### 1. Assessment of Dongle-based Software Copy Protection Combined with Additional Protection Methods
- **Authors:** Agnius Liutkevičius, Arūnas Vrubliauskas, Egidijus Kazanavičius
- **Year:** 2011
- **Venue:** Elektronika ir Elektrotechnika, Vol. 112, No. 6
- **DOI:** [https://doi.org/10.5755/j01.eee.112.6.459](https://doi.org/10.5755/j01.eee.112.6.459)
- **Summary:** Standalone challenge-response dongles susceptible to API hooking, USB emulation, memory patching. Multi-layered binding and code-in-token execution essential.

### 2. A Hardware-Based Software Protection Systems - Analysis of Security Dongles with Time Meters
- **Authors:** Ireneusz J. Józwiak, Krzysztof Marczak
- **Year:** 2007
- **Venue:** IEEE DepCoS-RELCOMEX '07
- **DOI:** [https://doi.org/10.1109/DEPCOS-RELCOMEX.2007.47](https://doi.org/10.1109/DEPCOS-RELCOMEX.2007.47)
- **Summary:** Dongles with tamper-resistant real-time clocks for offline lease enforcement. Attack surfaces: clock manipulation, replay, driver emulation.

### 3. Enhanced Smart-Card Based License Management
- **Authors:** Mikhail J. Atallah, Jiangtao Li
- **Year:** 2003
- **Venue:** IEEE CEC 2003
- **DOI:** [https://doi.org/10.1109/ICEC.2003.1210260](https://doi.org/10.1109/ICEC.2003.1210260)
- **Summary:** Smart cards as cryptographic coprocessors for offline licensing. Critical decryption routines offloaded to card's secure microcontroller.

### 4. ESP32-Based Hardware Key for Software Application Protection
- **Authors:** Alexandru-Ion Popovici, Florin-Daniel Anton
- **Year:** 2026
- **Venue:** Applied Sciences (MDPI), Vol. 16, Issue 9
- **DOI:** [https://doi.org/10.3390/app16094251](https://doi.org/10.3390/app16094251)
- **Summary:** ESP32-S3 based "code-in-dongle" with encrypted mutual-attestation session. Eliminates host binary patching.

---

## Category 2: TPM & Measured Boot

### 5. Design and Implementation of a TCG-based Integrity Measurement Architecture
- **Authors:** Reiner Sailer, Xiaolan Zhang, Trent Jaeger, Leendert van Doorn
- **Year:** 2004
- **Venue:** USENIX Security '04
- **Summary:** Seminal Linux IMA using TPM PCRs for tamper-evident execution logs and sealed storage.

### 6. Copilot: A Coprocessor-based Kernel Runtime Integrity Monitor
- **Authors:** Nick L. Petroni Jr. et al.
- **Year:** 2004
- **Venue:** USENIX Security '04
- **Summary:** Independent PCI coprocessor monitoring kernel integrity via DMA, detecting rootkits independently of host OS.

### 7. Hardware-Assisted Circumvention of Self-Hashing Software Tamper Resistance
- **Authors:** Paul C. van Oorschot, Anil Somayaji, Glenn Wurster
- **Year:** 2005
- **Venue:** IEEE TDSC, Vol. 2, No. 1
- **DOI:** [https://doi.org/10.1109/TDSC.2005.10](https://doi.org/10.1109/TDSC.2005.10)
- **Summary:** Exploiting split-TLB to fool self-checksumming. Justification for hardware roots of trust over software-only hashing.

---

## Category 3: Secure Enclaves (Intel SGX / ARM TrustZone)

### 8. A Case for Protecting Computer Games With SGX
- **Authors:** Erick Bauman, Zhiqiang Lin
- **Year:** 2016
- **Venue:** ACM SysTEX '16
- **DOI:** [https://doi.org/10.1145/3007788.3007792](https://doi.org/10.1145/3007788.3007792)
- **Summary:** Protecting proprietary offline desktop software using Intel SGX hardware enclaves.

### 9. Demystifying Arm TrustZone: A Comprehensive Survey
- **Authors:** Sandro Pinto, Nuno Santos
- **Year:** 2019
- **Venue:** ACM Computing Surveys (CSUR), Vol. 51, Issue 6
- **DOI:** [https://doi.org/10.1145/3291047](https://doi.org/10.1145/3291047)
- **Summary:** Exhaustive survey of ARM TrustZone for TEEs, secure boot, and offline DRM key protection.

### 10. Hypervision Across Worlds: Real-time Kernel Protection from ARM TrustZone
- **Authors:** Ahmed M. Azab et al.
- **Year:** 2014
- **Venue:** ACM CCS '14
- **DOI:** [https://doi.org/10.1145/2660267.2660353](https://doi.org/10.1145/2660267.2660353)
- **Summary:** TZ-RKP — using TrustZone Secure World for tamper-resistant kernel integrity validation.

---

## Category 4: Hardware Security Modules (HSM)

### 11. ABYSS: A Trusted Architecture for Software Protection
- **Authors:** Steve R. White, Liam Comerford
- **Year:** 1990
- **Venue:** IEEE TSE, Vol. 16, No. 6
- **DOI:** [https://doi.org/10.1109/32.55090](https://doi.org/10.1109/32.55090)
- **Summary:** Foundational work — tamper-resistant HSM executing encrypted software within physically shielded perimeter.

### 12. Toward Scaling Hardware Security Module for Emerging Cloud Services
- **Authors:** Florian Winkler, Stefan More, Thomas Zefferer
- **Year:** 2019
- **Venue:** ACM SysTEX '19
- **DOI:** [https://doi.org/10.1145/3342551.3342557](https://doi.org/10.1145/3342551.3342557)

---

## Category 5: Software Self-Protection (RASP & Guards)

### 13. Protecting Software Code by Guards
- **Authors:** Hoi Chang, Mikhail J. Atallah
- **Year:** 2001
- **Venue:** ACM DRM '01 / Springer LNCS 2320
- **DOI:** [https://doi.org/10.1007/3-540-47870-1_10](https://doi.org/10.1007/3-540-47870-1_10)
- **Summary:** Interlocking guard network — dynamic checksums, tamper detection, code repair, delayed failure payloads.

### 14. A Systematic Survey of Self-Protecting Software Systems
- **Authors:** Eric Yuan, Naeem Esfahani, Sam Malek
- **Year:** 2014
- **Venue:** ACM TAAS, Vol. 8, Issue 4
- **DOI:** [https://doi.org/10.1145/2555612](https://doi.org/10.1145/2555612)

### 15. Practical Integrity Protection with Oblivious Hashing
- **Authors:** Mohsen Ahmadvand et al.
- **Year:** 2018
- **Venue:** ACM ACSAC '18
- **DOI:** [https://doi.org/10.1145/3274694.3274732](https://doi.org/10.1145/3274694.3274732)
- **Summary:** Oblivious Hashing intertwined with self-checking. Thwarts split-TLB and emulator-assisted circumvention.

### 16. The Framework of Runtime Application Self-Protection Technology
- **Authors:** Petar Čisar, Sanja Maravić Čisar
- **Year:** 2016
- **Venue:** IEEE CINTI '16
- **DOI:** [https://doi.org/10.1109/CINTI.2016.7846383](https://doi.org/10.1109/CINTI.2016.7846383)

---

## Category 6: Moving Target Defense (MTD) & Diversification

### 17. Morpheus: A Vulnerability-Tolerant Secure Architecture Based on Ensembles of Moving Target Defenses with Churn
- **Authors:** Mark Gallagher et al.
- **Year:** 2019
- **Venue:** ACM ASPLOS '19
- **DOI:** [https://doi.org/10.1145/3297858.3304037](https://doi.org/10.1145/3297858.3304037)
- **Summary:** RISC-V architecture continuously randomizing code pointers, memory layout, instruction representations under 50ms intervals.

### 18. SoK: Automated Software Diversity
- **Authors:** Per Larsen, Andrei Homescu, Stefan Brunthaler, Michael Franz
- **Year:** 2014
- **Venue:** IEEE S&P '14
- **DOI:** [https://doi.org/10.1109/SP.2014.25](https://doi.org/10.1109/SP.2014.25)

### 19. Smashing the Gadgets: In-Place Code Randomization
- **Authors:** Vasilis Pappas, Michalis Polychronakis, Angelos D. Keromytis
- **Year:** 2012
- **Venue:** IEEE S&P '12
- **DOI:** [https://doi.org/10.1109/SP.2012.10](https://doi.org/10.1109/SP.2012.10)

### 20. Countering Code-Injection Attacks With Instruction-Set Randomization
- **Authors:** Gaurav S. Kc, Angelos D. Keromytis, Vassilis Prevelakis
- **Year:** 2003
- **Venue:** ACM CCS '03
- **DOI:** [https://doi.org/10.1145/948109.948146](https://doi.org/10.1145/948109.948146)
- **Summary:** Instruction-Set Randomization (ISR) — randomized opcodes decoded by emulator. Injected code fails to execute.

---

## Category 7: Polymorphic, Metamorphic & Packed Executables

### 21. Binary-Code Obfuscations in Prevalent Packer Tools
- **Authors:** Kevin A. Roundy, Barton P. Miller
- **Year:** 2013
- **Venue:** ACM Computing Surveys (CSUR), Vol. 46, Issue 1
- **DOI:** [https://doi.org/10.1145/2522968.2522972](https://doi.org/10.1145/2522968.2522972)

### 22. VMorph: A Virtualization/Metamorphic Framework for Binary Obfuscation
- **Authors:** Pierciro Caliandro et al.
- **Year:** 2025
- **Venue:** ITASEC & SERICS 2025

### 23. Watermarking, Tamper-Proofing, and Obfuscation — Tools for Software Protection
- **Authors:** Christian Collberg, Clark Thomborson
- **Year:** 2002
- **Venue:** IEEE TSE, Vol. 28, No. 8
- **DOI:** [https://doi.org/10.1109/TSE.2002.1027797](https://doi.org/10.1109/TSE.2002.1027797)
