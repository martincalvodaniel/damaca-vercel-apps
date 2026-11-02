"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useId, useState } from "react"
import { navigation } from "@/content/site"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const navigationId = useId()
  const closeMenu = useCallback(() => setIsOpen(false), [])
  const toggleMenu = useCallback(() => setIsOpen((value) => !value), [])
  return (
    <header className="site-header">
      <Link
        className="brand"
        href="/"
        onClick={closeMenu}
        aria-label="La Bottega di Pali, inicio"
      >
        <Image src="/images/logo.webp" width={76} height={76} alt="" priority />
        <span>
          La Bottega <i>di Pali</i>
        </span>
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls={navigationId}
        onClick={toggleMenu}
      >
        {isOpen ? "Cerrar" : "Menú"}{" "}
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      <nav
        id={navigationId}
        aria-label="Navegación principal"
        className={isOpen ? "navigation is-open" : "navigation"}
      >
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={closeMenu}>
            {item.label}
          </Link>
        ))}
        <Link
          className="nav-contact"
          href="/celebraciones/"
          onClick={closeMenu}
        >
          Ven en compañía <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  )
}
