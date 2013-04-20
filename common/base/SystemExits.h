/*
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 * SystemExits.cpp
 * Exit codes.
 * Copyright (C) 2013 Simon Newton
 */

#ifndef COMMON_BASE_SYSTEMEXITS_H_
#define COMMON_BASE_SYSTEMEXITS_H_

#if HAVE_CONFIG_H
#  include <config.h>
#endif

#ifdef HAVE_SYSEXITS_H
#include <sysexits.h>
#else
// Copied from the Berkeley sources.

#define EX_OK       0   /* successful termination */
#define EX__BASE    64  /* base value for error messages */
#define EX_USAGE    64  /* command line usage error */
#define EX_DATAERR  65  /* data format error */
#define EX_NOINPUT  66  /* cannot open input */
#define EX_NOUSER   67  /* addressee unknown */
#define EX_NOHOST   68  /* host name unknown */
#define EX_UNAVAILABLE  69  /* service unavailable */
#define EX_SOFTWARE 70  /* internal software error */
#define EX_OSERR    71  /* system error (e.g., can't fork) */
#define EX_OSFILE   72  /* critical OS file missing */
#define EX_CANTCREAT    73  /* can't create (user) output file */
#define EX_IOERR    74  /* input/output error */
#define EX_TEMPFAIL 75  /* temp failure; user is invited to retry */
#define EX_PROTOCOL 76  /* remote error in protocol */
#define EX_NOPERM   77  /* permission denied */
#define EX_CONFIG   78  /* configuration error */
#define EX__MAX 78  /* maximum listed value */
#endif

#endif  // COMMON_BASE_SYSTEMEXITS_H_