#!/system/bin/sh
# Uso: sh seekra.sh <arquivo .in.ID>
# O arquivo de entrada é escrito pelo Tasker (Write File) e apagado pelo script.
#   linha 1 : operação
#   demais  : chave=valor (valor cru, sem codificação; chave repetida acumula os
#             valores separados por quebra de linha, ex.: roots)
# Os dados nunca passam pela linha de comando do shell.
SEEKRA_MAX=${SEEKRA_MAX:-500}
SEEKRA_LIST_MAX=${SEEKRA_LIST_MAX:-2000}
SEEKRA_SCAN=${SEEKRA_SCAN:-50000}
BASE=$(cd "$(dirname "$0")" 2>/dev/null && pwd)
DATA=${SEEKRA_DATA:-$BASE/data}

NL='
'

die(){ printf '%s\n' "$*" >&2; exit 1; }

cleanup(){
  [ -n "$IN" ] && rm -f "$IN"
  [ -n "$tmp" ] && rm -f "$tmp" "$tmp.n"
  return 0
}

roots(){
  if [ -n "$SEEKRA_ROOTS" ]; then printf '%s\n' $SEEKRA_ROOTS; return; fi
  [ -d /storage/emulated/0 ] && echo /storage/emulated/0
  for d in /storage/????-????; do [ -d "$d" ] && echo "$d"; done
}

inroots(){
  case $1 in ''|..|../*|*/..|*/../*) return 1;; esac
  for r in $ALLROOTS; do
    case $1 in "$r"|"$r"/*) return 0;; esac
  done
  return 1
}

chk_roots(){
  printf '%s\n' "$p_roots" | while IFS= read -r r; do
    [ -z "$r" ] || inroots "$r" || exit 1
  done
}

num(){ case $1 in ''|*[!0-9]*) die "parâmetro numérico inválido";; esac; }

parse(){
  IFS= read -r op || [ -n "$op" ] || die "operação ausente"
  while IFS= read -r line || [ -n "$line" ]; do
    [ -n "$line" ] || continue
    case $line in *=*) ;; *) die "argumento inválido";; esac
    k=${line%%=*}
    v=${line#*=}
    case $k in ''|*[!a-z0-9]*) die "argumento inválido";; esac
    eval "seen=\${p_$k+1}"
    if [ -n "$seen" ]; then eval "p_$k=\$p_$k\$NL\$v"; else eval "p_$k=\$v"; fi
  done
}

norm(){
  sed -e 's/^directory|[0-9]*|/D|0|/' -e 's/^[^D|][^|]*|/f|/' -e 's/^D/d/'
}

stat_all(){
  tr '\n' '\0' | xargs -0 -r stat -c '%F|%s|%Y|%n' 2>/dev/null | norm
}

op_search(){
  [ -n "$p_roots" ] || p_roots=$ALLROOTS
  [ -n "$p_roots" ] || die "nenhuma raiz disponível"
  chk_roots || die "raiz não autorizada"
  max=${p_max:-$SEEKRA_MAX}; mb=${p_minmb:-0}; dy=${p_days:-0}
  num "$max"; num "$mb"; num "$dy"
  set -f
  IFS='
'
  set -- $p_roots
  unset IFS
  [ "${p_rec:-1}" = 0 ] && set -- "$@" -maxdepth 1
  set -- "$@" -type f
  [ "$mb" -gt 0 ] && set -- "$@" -size "+${mb}M"
  [ "$dy" -gt 0 ] && set -- "$@" -mtime "-$dy"
  if [ -n "$p_ext" ]; then
    set -- "$@" '('
    first=1
    IFS=,
    for e in $p_ext; do
      case $e in ''|*[!A-Za-z0-9]*) die "extensão inválida";; esac
      [ $first = 1 ] || set -- "$@" -o
      set -- "$@" -iname "*.$e"
      first=0
    done
    unset IFS
    set -- "$@" ')'
  fi
  if [ -n "$p_q" ] && [ "$p_mode" = regex ]; then
    mkdir -p "$DATA" || die "falha ao criar diretório de dados"
    tmp=$DATA/.s$$
    find "$@" 2>/dev/null | head -n "$SEEKRA_SCAN" > "$tmp"
    sed 's|.*/||' "$tmp" | grep -Ein -e "$p_q" 2>/dev/null | cut -d: -f1 | sed 's/$/p/' > "$tmp.n"
    sed -n -f "$tmp.n" "$tmp" | head -n "$max" | stat_all
    return
  fi
  [ -n "$p_q" ] && set -- "$@" -iname "*${p_q}*"
  find "$@" 2>/dev/null | head -n "$max" | stat_all
}

op_ia(){
  c=$p_cmd
  case $c in
    *';'*|*'&'*|*'|'*|*'<'*|*'>'*|*'`'*|*'$'*|*'{'*|*'}'*|*'
'*) die "caracteres não permitidos";;
  esac
  case $c in 'find '*' -print') ;; *) die "o comando deve ser find … -print";; esac
  max=${p_max:-$SEEKRA_MAX}; num "$max"
  set -f
  chk=$(printf '%s' "$c" | tr -d "'\"\\\\")
  set -- $chk
  shift
  state=roots
  for w; do
    if [ $state = roots ]; then
      case $w in
        -*|'('|'!') state=expr;;
        *) inroots "$w" || die "raiz não autorizada: $w"; continue;;
      esac
    fi
    case $w in
      -type|-iname|-name|-size|-mtime|-mmin|-path|-ipath|-prune|-print|-o|-a|-not|-maxdepth|-mindepth|-regex|-iregex|-newer) ;;
      -[0-9]*) ;;
      -*) die "opção não permitida: $w";;
    esac
  done
  [ $state = expr ] || die "comando sem filtros"
  eval "$c" 2>/dev/null | head -n "$max" | stat_all
}

op_list(){
  d=${p_dir%/}
  inroots "$d" || die "pasta fora das raízes autorizadas"
  [ -d "$d" ] || die "pasta inexistente"
  max=${p_max:-$SEEKRA_LIST_MAX}; num "$max"
  [ -r "$d" ] || die "pasta sem permissão de leitura"
  find -L "$d" -mindepth 1 -maxdepth 1 \( -type d -printf 'd|0|%T@|%p\n' \) -o -printf 'f|%s|%T@|%p\n' 2>/dev/null \
    | sed 's/^\([df]|[0-9]*|[0-9]*\)\.[0-9]*|/\1|/' \
    | LC_ALL=C sort -t'|' -k1,1 -k4 \
    | head -n "$max"
}

IN=$1
[ -f "$IN" ] || die "arquivo de entrada ausente"
case ${IN##*/} in .in.*) ;; *) die "arquivo de entrada inválido";; esac
trap cleanup EXIT

parse < "$IN"
rm -f "$IN"
cd "$BASE" 2>/dev/null
exec < /dev/null
ALLROOTS=$(roots)

[ -n "$op" ] || die "operação ausente"
case $op in
  search|ia|list) "op_$op";;
  *) die "operação desconhecida: $op";;
esac
