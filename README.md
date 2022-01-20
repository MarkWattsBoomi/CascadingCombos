This module provides a cascading combo box implementation. 

# Class Name

CascadingCombo

## Functionality

Takes a LIST of options with each combo's values in a property and turns it into an array of combo's (one per list item property).

Choosing a value from one combo changes the options in the subsequent combo.


## Datasource

Set the datasource to a list of objects with one property per combo like this: -

Animal, Mamal, Mouse
Animal, Mamal, Horse
Animal, Reptile, Lizard
Animal, Reptile, Crocodile
Vegetable, Fruit, Banana
Vegetable, Fruit, Apple


## State

Create a State object of the type of the model data items.



## Settings

### Columns

Sets the display columns which will become combo boxes.

### Label

The Label of the component is used as the title bar

### Width & Height

If specified then these are applied as pixel values.

## Component Attributes

### classes

Like all components, adding a "classes" attribute will cause that string to be added to the base component's class value


## Styling

All elements of the tree can be styled by adding the specific style names to your player.


## Page Conditions

The component respects the show / hide rules applied by the containing page.


