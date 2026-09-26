# Research Papers: Software Supply Chain Security, SBOM & Integrity

> **Agent:** Supply Chain Security Researcher | **Papers Found:** 25

---

## 1. Surveys, Taxonomies & Research Agendas

### 1. SoK: A Taxonomy of Attacks on Open-Source Software Supply Chains
- **Authors:** Piergiorgio Ladisa, Henrik Plate, Matias Martinez, Olivier Barais
- **Year:** 2023
- **Venue:** IEEE S&P 2023
- **DOI:** [10.1109/SP46215.2023.10179304](https://doi.org/10.1109/SP46215.2023.10179304)
- **Summary:** Ecosystem-agnostic taxonomy of 107 discrete attack vectors spanning the entire open-source supply chain.

### 2. Research Directions in Software Supply Chain Security
- **Authors:** Laurie Williams et al.
- **Year:** 2025
- **Venue:** ACM TOSEM, Vol. 34, No. 5
- **DOI:** [10.1145/3714464](https://doi.org/10.1145/3714464)
- **Summary:** Research roadmap for verifiable provenance, SBOM scalability, and human factors.

### 3. SoK: Analysis of Software Supply Chain Security by Establishing Secure Design Properties
- **Authors:** Chinenye Okafor et al.
- **Year:** 2022
- **Venue:** ACM SCORED '22
- **DOI:** [10.1145/3560835.3564556](https://doi.org/10.1145/3560835.3564556)
- **Summary:** Three foundational properties — transparency, validity, separation. Evaluates SLSA and in-toto.

### 4. Software Supply Chain Security: A Systematic Literature Review
- **Authors:** Beatriz M. Reichert, Rafael R. Obelheiro
- **Year:** 2024
- **Venue:** International Journal of Computers and Applications, Vol. 46, No. 10
- **DOI:** [10.1080/1206212X.2024.2390978](https://doi.org/10.1080/1206212X.2024.2390978)

---

## 2. Software Bill of Materials (SBOM)

### 5. An Empirical Study on Software Bill of Materials: Where We Stand and the Road Ahead
- **Authors:** Boming Xia et al.
- **Year:** 2023
- **Venue:** IEEE/ACM ICSE 2023
- **DOI:** [10.1109/ICSE48619.2023.00219](https://doi.org/10.1109/ICSE48619.2023.00219)

### 6. On the Way to SBOMs: Investigating Design Issues and Solutions in Practice
- **Authors:** Tingting Bi et al.
- **Year:** 2024
- **Venue:** ACM TOSEM, Vol. 33, No. 5
- **DOI:** [10.1145/3654442](https://doi.org/10.1145/3654442)

### 7. Challenges of Producing Software Bill of Materials for Java
- **Authors:** Musard Balliu, Benoit Baudry et al.
- **Year:** 2023
- **Venue:** IEEE Security & Privacy, Vol. 21, No. 6
- **DOI:** [10.1109/MSEC.2023.3302956](https://doi.org/10.1109/MSEC.2023.3302956)

### 8. Accuracy Evaluation of SBOM Tools
- **Authors:** Andreas Halbritter, Dominik Merli
- **Year:** 2024
- **Venue:** ARES 2024
- **DOI:** [10.1145/3664476.3670926](https://doi.org/10.1145/3664476.3670926)

### 9. Software Bill of Materials Adoption: A Mining Study from GitHub
- **Authors:** Sabato Nocera et al.
- **Year:** 2023
- **Venue:** IEEE ICSME 2023
- **DOI:** [10.1109/ICSME58846.2023.00014](https://doi.org/10.1109/ICSME58846.2023.00014)

---

## 3. Provenance, Attestation & Integrity Verification

### 10. in-toto: Providing Farm-to-Table Guarantees for Bits and Bytes
- **Authors:** Santiago Torres-Arias et al.
- **Year:** 2019
- **Venue:** USENIX Security '19
- **Summary:** End-to-end cryptographic provenance verification across every pipeline step.

### 11. Sigstore: Software Signing for Everybody
- **Authors:** Zachary Newman, John Speed Meyers, Santiago Torres-Arias
- **Year:** 2022
- **Venue:** ACM CCS '22
- **DOI:** [10.1145/3548606.3560596](https://doi.org/10.1145/3548606.3560596)
- **Summary:** Keyless cryptographic signing with transparency logs.

### 12. Signing in Four Public Software Package Registries
- **Authors:** Taylor R. Schorlemmer et al.
- **Year:** 2024
- **Venue:** IEEE S&P 2024
- **DOI:** [10.1109/SP54263.2024.00215](https://doi.org/10.1109/SP54263.2024.00215)

### 13. Analyzing Challenges in Deployment of the SLSA Framework
- **Authors:** Mahzabin Tamanna et al.
- **Year:** 2024
- **Venue:** arXiv:2409.05014
- **DOI:** [10.48550/arXiv.2409.05014](https://doi.org/10.48550/arXiv.2409.05014)

---

## 4. Package Manager Attacks & Malware Injection Defense

### 14. Backstabber's Knife Collection: A Review of Open Source Software Supply Chain Attacks
- **Authors:** Marc Ohm et al.
- **Year:** 2020
- **Venue:** DIMVA 2020 / Springer
- **DOI:** [10.1007/978-3-030-52683-2_2](https://doi.org/10.1007/978-3-030-52683-2_2)
- **Summary:** 174 malicious packages analyzed — information stealers, cryptominers, reverse shells.

### 15. Towards Measuring Supply Chain Attacks on Package Managers
- **Authors:** Ruian Duan et al.
- **Year:** 2021
- **Venue:** NDSS 2021
- **Summary:** Mal-PEG framework detected 300+ zero-day malicious packages.

### 16. Practical Automated Detection of Malicious npm Packages
- **Authors:** Adriana Sejfia, Max Schäfer
- **Year:** 2022
- **Venue:** IEEE/ACM ICSE 2022
- **DOI:** [10.1145/3510003.3510104](https://doi.org/10.1145/3510003.3510104)

### 17. DONAPI: Malicious NPM Packages Detector
- **Authors:** Cheng Huang et al.
- **Year:** 2024
- **Venue:** USENIX Security '24

### 18. Small World with High Risks: npm Ecosystem
- **Authors:** Markus Zimmermann et al.
- **Year:** 2019
- **Venue:** USENIX Security '19

### 19. An Empirical Study of Malicious Code in PyPI
- **Authors:** Wenbo Guo et al.
- **Year:** 2023
- **Venue:** IEEE/ACM ASE 2023

### 20. Towards Robust Detection of Supply Chain Poisoning
- **Authors:** Xinyi Zheng et al.
- **Year:** 2024
- **Venue:** IEEE/ACM ASE 2024

---

## 5. Source Trojans, Backdoors & Code Injection

### 21. Trojan Source: Invisible Vulnerabilities
- **Authors:** Nicholas Boucher, Ross Anderson
- **Year:** 2023
- **Venue:** USENIX Security '23
- **Summary:** Unicode BiDi attacks making source code appear benign while compiling to malicious logic.

### 22. Dirty-Waters: Detecting Software Supply Chain Smells
- **Authors:** Raphina Liu et al.
- **Year:** 2025
- **Venue:** ACM FSE 2025
- **DOI:** [10.1145/3696630.3728578](https://doi.org/10.1145/3696630.3728578)

---

## 6. Reproducible Builds & Build Pipeline Integrity

### 23. It's like flossing your teeth: Reproducible Builds
- **Authors:** Marcel Fourné et al.
- **Year:** 2023
- **Venue:** IEEE S&P 2023
- **Summary:** Critical for detecting compromised build infrastructure (SolarWinds-style attacks).

### 24. Automated Patching for Unreproducible Builds
- **Authors:** Zhilei Ren et al.
- **Year:** 2022
- **Venue:** IEEE/ACM ICSE 2022

---

## 7. Secure Software Updates

### 25. Survivable Key Compromise in Software Update Systems (TUF)
- **Authors:** Justin Samuel, Nick Mathewson, Justin Cappos, Roger Dingledine
- **Year:** 2010
- **Venue:** ACM CCS '10
- **DOI:** [10.1145/1866307.1866315](https://doi.org/10.1145/1866307.1866315)
- **Summary:** The Update Framework (TUF) — cryptographic resilience against compromised signing keys and mirror servers.
