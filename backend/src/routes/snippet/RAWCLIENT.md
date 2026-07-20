# Snippet Raw Client Specification

Dokumen ini mencatat rancangan header, query, dan body untuk setiap endpoint snippet.

---

## GET /snippet/list

**Headers:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `authorization` | string | Yes | Account token |

**Query:** None

**Body:** None

---

## POST /snippet/create

**Headers:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `authorization` | string | Yes | Account token |

**Query:** None

**Body:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `alias` | string | Yes | Unique identifier snippet (1-255 chars) |
| `description` | string | No | Deskripsi snippet, nullable |
| `command` | string | Yes | Command yang akan disimpan |

---

## DELETE /snippet/delete

**Headers:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `authorization` | string | Yes | Account token |

**Query:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `alias` | string | Yes | Alias snippet yang akan dihapus |

**Body:** None

---

## PATCH /snippet/edit

**Headers:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `authorization` | string | Yes | Account token |

**Query:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `alias` | string | Yes | Alias snippet yang akan diedit |

**Body:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `command` | string | Yes | Command baru (satu-satunya field yang bisa diedit) |
