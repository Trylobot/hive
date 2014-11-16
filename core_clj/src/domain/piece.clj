(ns hive.piece
  (:require 
    [clojure.string :as string]))

(defn create
  [color type]
  ({:color color
    :type type }))

(defn opposite-color
  [color]
  (case color
    :white :black
    :black :white))

(defn encode
  [piece]
  (str (get piece :color) "," (get piece :type)))

(defn decode
  [piece-key]
  (let [parts (string/split piece_key #",")]
    (create (get parts 0) (get parts 1))))

