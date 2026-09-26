# Research Papers: White-Box Cryptography, Anti-Debugging & DRM

> **Agent:** White-Box Crypto & DRM Researcher | **Papers Found:** 26

---

## Part 1: White-Box Cryptography & Cryptanalysis (7 papers)

### 1. White-Box Cryptography and an AES Implementation
- **Authors:** Stanley Chow, Philip A. Eisen, Harold Johnson, Paul C. van Oorschot
- **Year:** 2002
- **Venue:** SAC 2002 / Springer LNCS 2595
- **DOI:** [https://doi.org/10.1007/3-540-36492-7_19](https://doi.org/10.1007/3-540-36492-7_19)
- **Summary:** Seminal paper formalizing the white-box threat model. First white-box AES implementation replacing round keys and S-boxes with key-dependent lookup tables composed with secret bijections.

### 2. A White-Box DES Implementation for DRM Applications
- **Authors:** Stanley Chow, Philip A. Eisen, Harold Johnson, Paul C. van Oorschot
- **Year:** 2002
- **Venue:** ACM CCS Workshop on DRM 2002 / Springer LNCS 2696
- **DOI:** [https://doi.org/10.1007/978-3-540-44993-5_1](https://doi.org/10.1007/978-3-540-44993-5_1)
- **Summary:** White-box DES for DRM content players. Cryptographic operations embedded as networked lookup tables, enabling decryption without exposing keys.

### 3. Cryptanalysis of a White Box AES Implementation
- **Authors:** Olivier Billet, Henri Gilbert, Charaf Ech-Chatbi
- **Year:** 2004
- **Venue:** SAC 2004 / Springer LNCS 3357
- **DOI:** [https://doi.org/10.1007/978-3-540-30564-4_16](https://doi.org/10.1007/978-3-540-30564-4_16)
- **Summary:** Landmark "BGE attack" dismantling Chow et al.'s white-box AES. Recovers 128-bit AES key in ~2^30 operations by analyzing affine equivalences.

### 4. Differential Computation Analysis: Hiding Your White-Box Designs is Not Enough
- **Authors:** Joppe W. Bos, Charles Hubain, Wil Michiels, Philippe Teuwen
- **Year:** 2016
- **Venue:** CHES 2016 / Springer LNCS 9813 — **CHES Best Paper Award**
- **DOI:** [https://doi.org/10.1007/978-3-662-53140-2_5](https://doi.org/10.1007/978-3-662-53140-2_5)
- **Summary:** Introduces Differential Computation Analysis (DCA) — adapting DPA to software binaries. Automatically extracts cryptographic keys from obfuscated implementations without manual reverse engineering.

### 5. White-Box Cryptography Revisited: Space-Hard Ciphers
- **Authors:** Andrey Bogdanov, Takanori Isobe
- **Year:** 2015
- **Venue:** ACM CCS '15
- **DOI:** [https://doi.org/10.1145/2810103.2813699](https://doi.org/10.1145/2810103.2813699)
- **Summary:** Introduces "space-hard ciphers" (SPACE block cipher) requiring large memory tables so adversaries cannot exfiltrate decryption capability.

### 6. Defeating State-of-the-Art White-Box Countermeasures with Advanced Gray-Box Attacks
- **Authors:** Louis Goubin, Matthieu Rivain, Junwei Wang
- **Year:** 2020
- **Venue:** IACR TCHES, Vol. 2020, Issue 3
- **DOI:** [https://doi.org/10.13154/tches.v2020.i3.454-482](https://doi.org/10.13154/tches.v2020.i3.454-482)
- **Summary:** High-order multivariate DCA and linear regression attacks compromising all three WhibOx 2019 competition winners.

### 7. A Survey on Whitebox Cryptography
- **Authors:** Harshvardhan Bhatt
- **Year:** 2021
- **Venue:** JoSETTT, Vol. 8, Issue 2
- **DOI:** [https://doi.org/10.37591/josettt.v8i2.909](https://doi.org/10.37591/josettt.v8i2.909)
- **Summary:** Synthesizes two decades of WBC progression. Categorizes attack vectors and examines deployment in mobile payments and DRM.

---

## Part 2: Anti-Debugging & Evasion Techniques (6 papers)

### 8. Towards an Understanding of Anti-Virtualization and Anti-Debugging Behavior in Modern Malware
- **Authors:** Xu Chen, Jon Andersen, Z. Morley Mao, Michael Bailey, Jose Nazario
- **Year:** 2008
- **Venue:** IEEE DSN 2008
- **DOI:** [https://doi.org/10.1109/DSN.2008.4630086](https://doi.org/10.1109/DSN.2008.4630086)
- **Summary:** Large-scale taxonomy of anti-debugging and anti-virtualization tactics — PEB interrogation, SEH manipulation, RDTSC timing, hardware breakpoint checks.

### 9. Software Protection Through Anti-Debugging
- **Authors:** Michael N. Gagnon, Stephen Taylor, Anup K. Ghosh
- **Year:** 2007
- **Venue:** IEEE Security & Privacy, Vol. 5, Issue 3
- **DOI:** [https://doi.org/10.1109/MSP.2007.71](https://doi.org/10.1109/MSP.2007.71)
- **Summary:** Anti-debugging for commercial IP and license protection. Code integrity checks, self-debugging, intentional exception throwing.

### 10. Towards Transparent Debugging
- **Authors:** Fengwei Zhang, Kevin Leach, Angelos Stavrou, Haining Wang, Kun Sun
- **Year:** 2018
- **Venue:** IEEE TDSC, Vol. 15, Issue 2
- **DOI:** [https://doi.org/10.1109/TDSC.2016.2545671](https://doi.org/10.1109/TDSC.2016.2545671)
- **Summary:** MalT — transparent debugging in x86 System Management Mode (SMM). Bypasses all software anti-debugging checks.

### 11. Ether: Malware Analysis via Hardware Virtualization Extensions
- **Authors:** Artem Dinaburg, Paul Royal, Monirul Sharif, Wenke Lee
- **Year:** 2008
- **Venue:** ACM CCS '08
- **DOI:** [https://doi.org/10.1145/1455770.1455779](https://doi.org/10.1145/1455770.1455779)
- **Summary:** Intel VT-x hardware virtualization for stealthy analysis. Defeats client-side anti-debugging by residing outside guest OS address space.

### 12. Malware Dynamic Analysis Evasion Techniques: A Survey
- **Authors:** Amir Afianian, Salman Niksefat, Babak Sadeghiyan, David Baptiste
- **Year:** 2019
- **Venue:** ACM Computing Surveys (CSUR), Vol. 52, Issue 6
- **DOI:** [https://doi.org/10.1145/3365001](https://doi.org/10.1145/3365001)
- **Summary:** Comprehensive taxonomy of evasion techniques — environmental detection, timing attacks, anti-debugging, sandbox evasion.

### 13. SoK: Using Dynamic Binary Instrumentation for Security
- **Authors:** Daniele Cono D'Elia et al.
- **Year:** 2019
- **Venue:** ACM AsiaCCS '19
- **DOI:** [https://doi.org/10.1145/3321705.3329819](https://doi.org/10.1145/3321705.3329819)
- **Summary:** How protected binaries detect and defeat DBI frameworks (Pin, DynamoRIO, Frida). Code cache signatures, thread injection discrepancies, jitter profiling.

---

## Part 3: Software DRM & License Protection (5 papers)

### 14. Protecting Software Code by Guards
- **Authors:** Hoi Chang, Mikhail J. Atallah
- **Year:** 2002
- **Venue:** ACM DRM 2001 / Springer LNCS 2320
- **DOI:** [https://doi.org/10.1007/3-540-47870-1_10](https://doi.org/10.1007/3-540-47870-1_10)
- **Summary:** Software "guards" — cooperative code snippets for mutual tamper-proofing, self-checking, and license enforcement.

### 15. Watermarking, Tamper-Proofing, and Obfuscation - Tools for Software Protection
- **Authors:** Christian S. Collberg, Clark Thomborson
- **Year:** 2002
- **Venue:** IEEE TSE, Vol. 28, Issue 8
- **DOI:** [https://doi.org/10.1109/TSE.2002.1027797](https://doi.org/10.1109/TSE.2002.1027797)
- **Summary:** Unifies primary software protection techniques — obfuscation, tamper-proofing, and watermarking. Establishes formal models and metrics.

### 16. Obfuscation of Executable Code to Improve Resistance to Static Disassembly
- **Authors:** Cullen Linn, Saumya K. Debray
- **Year:** 2003
- **Venue:** ACM CCS '03
- **DOI:** [https://doi.org/10.1145/948109.948149](https://doi.org/10.1145/948109.948149)
- **Summary:** Binary transformation disrupting IDA Pro — interleaving junk bytes, branch functions computing target addresses dynamically.

### 17. A First Look at Digital Rights Management Systems for Secure Mobile Content Delivery
- **Authors:** Amir Rafi, Carlton Shepherd, Konstantinos Markantonakis
- **Year:** 2023
- **Venue:** IEEE TrustCom 2023
- **DOI:** [https://doi.org/10.1109/TrustCom60117.2023.00087](https://doi.org/10.1109/TrustCom60117.2023.00087)
- **Summary:** Analyzes production DRM — Google Widevine, Apple FairPlay, Microsoft PlayReady. Evaluates TEE interactions and fallback vulnerabilities.

### 18. A Taxonomy of Software Integrity Protection Techniques
- **Authors:** Mohsen Ahmadvand, Alexander Pretschner, Florian Kelbert
- **Year:** 2019
- **Venue:** Advances in Computers, Vol. 112, Elsevier
- **DOI:** [https://doi.org/10.1016/bs.adcom.2017.12.007](https://doi.org/10.1016/bs.adcom.2017.12.007)
- **Summary:** Structured taxonomy for "Man-At-The-End" (MATE) attack context — trigger conditions, integrity verification primitives, reactive countermeasures.

---

## Part 4: Cryptographic Piracy Prevention & Theory (4 papers)

### 19. Towards a Theory of Software Protection and Simulation by Oblivious RAMs
- **Authors:** Oded Goldreich / Rafail Ostrovsky
- **Year:** 1987 (STOC) / 1996 (JACM)
- **Venue:** ACM STOC '87 / JACM Vol. 43, Issue 3
- **DOI:** [https://doi.org/10.1145/233551.233553](https://doi.org/10.1145/233551.233553)
- **Summary:** Foundational theory for software protection. Introduces Oblivious RAM (ORAM) — programs execute while concealing memory access patterns.

### 20. Quantum Copy-Protection and Quantum Money
- **Authors:** Scott Aaronson
- **Year:** 2009
- **Venue:** IEEE CCC 2009
- **DOI:** [https://doi.org/10.1109/CCC.2009.42](https://doi.org/10.1109/CCC.2009.42)
- **Summary:** Quantum no-cloning theorem makes software duplication physically impossible. Uncloneable quantum states for license verification.

### 21. Secure Software Leasing
- **Authors:** Prabhanjan Ananth, Rolando L. La Placa
- **Year:** 2021
- **Venue:** EUROCRYPT 2021 / Springer LNCS 12697
- **DOI:** [https://doi.org/10.1007/978-3-030-77886-6_18](https://doi.org/10.1007/978-3-030-77886-6_18)
- **Summary:** Formalizes "Secure Software Leasing" (SSL) — cryptographic subscription licensing where client cannot retain functionality after lease terminates.

### 22. Software Watermarking: Models and Dynamic Embeddings
- **Authors:** Christian Collberg, Clark Thomborson
- **Year:** 1999
- **Venue:** ACM POPL '99
- **DOI:** [https://doi.org/10.1145/292540.292569](https://doi.org/10.1145/292540.292569)
- **Summary:** Dynamic graph-based watermarks encoding identity numbers into heap data structures during execution.

---

## Part 5: Hardware Dongle Security (2 papers)

### 23. Security Strength Measurement for Dongle-Protected Software
- **Authors:** Ugo Piazzalunga, Paolo Salvaneschi et al.
- **Year:** 2007
- **Venue:** IEEE Security & Privacy, Vol. 5, Issue 6
- **DOI:** [https://doi.org/10.1109/MSP.2007.176](https://doi.org/10.1109/MSP.2007.176)
- **Summary:** Quantitative metric for dongle security — USB sniffing, API hooking, replay attacks, virtual dongle emulation.

### 24. A Hardware-Based Software Protection Systems - Analysis of Security Dongles with Memory
- **Authors:** Ireneusz Józwiak, Arkadiusz Liber, Krzysztof Marczak
- **Year:** 2007
- **Venue:** IEEE ICCGI 2007
- **DOI:** [https://doi.org/10.1109/ICCGI.2007.2](https://doi.org/10.1109/ICCGI.2007.2)
- **Summary:** Internal architecture of hardware dongles with non-volatile memory. Communication protocols, challenge-response mechanisms, implementation flaws.

---

## Part 6: Code Signing Security (2 papers)

### 25. Certified Malware: Measuring Breaches of Trust in the Windows Code-Signing PKI
- **Authors:** Doowon Kim, Bum Jun Kwon, Tudor Dumitraș
- **Year:** 2017
- **Venue:** ACM CCS '17
- **DOI:** [https://doi.org/10.1145/3133956.3133958](https://doi.org/10.1145/3133956.3133958)
- **Summary:** First comprehensive measurement of code-signing abuse — 325,000+ signed malware samples. Compromised keys, illicit certificates, Authenticode exploits.

### 26. The Broken Shield: Measuring Revocation Effectiveness in the Windows Code-Signing PKI
- **Authors:** Doowon Kim, Bum Jun Kwon et al.
- **Year:** 2018
- **Venue:** USENIX Security '18
- **Link:** [USENIX Proceedings](https://www.usenix.org/conference/usenixsecurity18/presentation/kim)
- **Summary:** Critical failures in certificate revocation — omitted dates, delayed CRL distribution, OS "soft-fail" allowing revoked certificates to validate malware.
